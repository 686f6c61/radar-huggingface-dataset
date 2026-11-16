# fastforks/sea-raft

## Resumen

SEA-RAFT es un modelo de estimación de flujo óptico (optical flow) que implementa la arquitectura presentada por Wang, Lipson y Deng en 2024. El modelo parte de RAFT (Recurrent All-Pairs Field Transforms) e introduce dos cambios clave: codificadores ResNet con un flujo inicial regresado directamente de las características de contexto, y un bloque de actualización basado en ConvNeXt. El resultado es que basta con 4 iteraciones para obtener flujo de alta calidad, frente a las decenas que requieren las variantes clásicas de RAFT. La pirámide de correlación opera a resolución 1/8 y el upsampling final es convexo.

Este repositorio concreto, `fastforks/sea-raft`, no aloja pesos: es una model card de integración para la librería `fastforks`, que descarga los pesos originales de los repositorios del autor (MemorySlices) y los verifica contra hashes SHA-256. El modelo está pensado para estimar movimiento píxel a píxel (dx, dy) entre dos fotogramas RGB consecutivos, una tarea fundamental en vídeo, robótica, conducción autónoma y postproducción.

Es relevante porque ofrece un rendimiento de referencia en benchmarks de flujo óptico (KITTI, Sintel) con licencia BSD-3-Clause que permite uso comercial, y porque la integración `fastforks` añade backends optimizados (`portable` y `kernels`) con aceleraciones de hasta 5x respecto a la implementación original. Existen variantes M y S, además de checkpoints específicos para KITTI, Sintel/Spring y FlyingThings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT con codificadores ResNet, flujo inicial regresado de features de contexto y bloque de actualización ConvNeXt; pirámide de correlación a 1/8 y upsampling convexo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 (original), fp16 (soportado en backend portable) |
| Idiomas soportados | no disponible (modelo sin capacidades lingüísticas) |
| Licencia | BSD-3-Clause (código y pesos) |
| Formato de pesos | safetensors |
| Entrada | dos imágenes RGB consecutivas |
| Salida | flujo óptico por píxel (dx, dy) |
| Tamaño de entrada | cualquier H x W >= 128 (>= 256 en variantes spring), con padding a múltiplo de 8 |
| Variantes | `sea-raft-m`, `sea-raft-s` y sufijos `-kitti`, `-spring`, `-things` |
| Backends | `portable`, `kernels` |

## Arquitectura y entrenamiento

SEA-RAFT sigue el esquema RAFT: un par de imágenes se procesa mediante codificadores ResNet que extraen características a múltiples escalas, sobre las que se construye una pirámide de correlación a resolución 1/8. La innovación principal es que el flujo inicial se regresa directamente de las características de contexto en lugar de partir de cero, y que el bloque iterativo de actualización usa ConvNeXt. Esto reduce drásticamente el número de iteraciones necesarias: con 4 iteraciones se alcanza calidad competitiva, y con 12 iteraciones la variante M equivale a la configuración "L" del paper.

El entrenamiento sigue el protocolo clásico de RAFT en varias fases. Primero, preentrenamiento en TartanAir. Después, ajuste en FlyingChairs y FlyingThings3D. Finalmente, una mezcla de FlyingThings3D, Sintel, KITTI 2015 y HD1K (denominada TSKH) que da lugar a los checkpoints generales `sea-raft-m` y `sea-raft-s`. Las variantes `-kitti` se ajustan específicamente para KITTI, las `-spring` para vídeo a 1080p (evaluadas a media resolución con upsampling y duplicación del flujo), y `sea-raft-m-things` corresponde al ajuste solo con FlyingThings. No se documenta en la información disponible el uso de RLHF ni de técnicas de alineación, algo esperable en un modelo de visión.

## Capacidades

- Estimación de flujo óptico denso entre dos fotogramas RGB consecutivos, devolviendo un vector (dx, dy) por píxel.
- Manejo de resoluciones variables: cualquier H x W >= 128 (o >= 256 en variantes spring), con padding automático a múltiplo de 8.
- Procesamiento de imágenes de alta resolución: probado hasta 1024x2048 en variantes M/S estándar y hasta 1988x2880 en variantes spring.
- Inferencia en fp16 con backend `portable`, con consumo de memoria reducido respecto a fp32.
- Backend `kernels` con aceleración de hasta 5x frente a la implementación original.
- Verificación de integridad de pesos mediante SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Estabilización de vídeo: el modelo estima el movimiento entre fotogramas consecutivos, lo que permite compensar el jitter de cámara en postproducción; su capacidad de procesar 1080p en pocos cientos de milisegundos lo hace viable para pipelines offline.
- Interpolación de fotogramas: a partir del flujo entre dos fotogramas se pueden sintetizar fotogramas intermedios para aumentar la tasa de refresco en vídeo o animación, usando las variantes spring optimizadas para 1080p.
- Odometría visual en robótica: el flujo denso alimenta estimadores de movimiento de cámara y SLAM; la licencia BSD-3-Clause permite integrarlo en productos comerciales sin restricciones de copyleft.
- Conducción autónoma y ADAS: las variantes `-kitti` están ajustadas específicamente para escenas de conducción, donde el flujo permite detectar movimiento de vehículos y peatones respecto al fondo.
- Análisis de movimiento en vídeo médico o deportivo: el flujo denso cuantifica desplazamientos submilimétricos o de alta velocidad entre fotogramas, útil para seguimiento de tejidos o análisis biomecánico.
- Segmentación guiada por movimiento: el flujo se usa como señal auxiliar para separar objetos en movimiento del fondo en tareas de matting y rotoscopia.
- Preprocesado para modelos de vídeo: el flujo generado puede alimentar modelos generativos de vídeo o de predicción de siguiente fotograma que requieran una representación explícita del movimiento.

## Benchmarks y rendimiento

Resultados del paper citados en la model card (zero-shot tras FlyingChairs + FlyingThings, pesos C-T):

| Benchmark | Métrica | Resultado (M) |
|---|---|---|
| KITTI 2015 train | EPE | 4.29 |
| KITTI 2015 train | Fl-all | 14.2 % |
| Sintel train | EPE clean | 1.21 |
| Sintel train | EPE final | 4.04 |

Rendimiento medido en la integración `fastforks` (entrada sintética 1080x1920, RTX 5060 Ti 16 GB):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|
| `sea-raft-m` | 504 | 367 | 270 | 73.1 | 5.0x | 6060 / 6180 | 435 / 514 |
| `sea-raft-m-spring` | 96.1 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: 8.3 GiB en pico asignado (9.4 GiB reservado) para `sea-raft-m` a 1024x2048 en fp16 con backend portable; 4.1 GiB en pico (4.8 GiB reservado) para `sea-raft-m-spring` a 1988x2880.
- Con backend `kernels`, la memoria pico baja a 435 MiB asignados (514 MiB reservados) en el caso 1080x1920 de `sea-raft-m`.
- GPU probada en la documentación: RTX 5060 Ti 16 GB. No se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo con al menos 8 GB de VRAM para resoluciones 1080p en fp16; para 4K se recomienda 12-16 GB o el backend `kernels`.
- Opciones de despliegue: librería `fastforks` con backends `portable` (PyTorch) y `kernels` (kernels CUDA optimizados). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia: 73.1 ms por par de fotogramas 1080x1920 con backend `kernels` en RTX 5060 Ti; 270 ms con `portable`; 367 ms con la implementación original.

## Comparativa con modelos similares

| Modelo | Arquitectura | Iteraciones | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|
| SEA-RAFT (este) | RAFT + ConvNeXt update | 4 (12 para config. L) | BSD-3-Clause | Sí | Pesos en HF (MemorySlices) + integración fastforks |
| RAFT original (princeton-vl) | RAFT con GRU | 12-32 | BSD-3-Clause | Sí | Pesos en GitHub |
| FlowFormer | Transformer | no disponible | no disponible | no disponible | Pesos en GitHub |
| GMFlow | Transformer global matching | 1 | no disponible | no disponible | Pesos en GitHub |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada; la comparativa se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: solo la model card. La descarga y verificación de pesos depende de la librería `fastforks` y de los repositorios del autor (MemorySlices).
- Modelo puramente de visión: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- El flujo óptico asume movimiento entre dos fotogramas consecutivos; oclusiones, cambios de iluminación bruscos y movimientos muy grandes pueden degradar la estimación.
- Las variantes `-spring` requieren entradas de al menos 256x256 y están diseñadas para evaluarse a media resolución con upsampling posterior; usarlas a resolución completa puede dar resultados distintos a los reportados.
- Las variantes `-kitti` están ajustadas para escenas de conducción y pueden generalizar peor en otros dominios.
- Aunque la licencia BSD-3-Clause permite uso comercial, la model card indica que el paquete original es de "research-use" y recomienda revisar las cadenas de licencia antes de otros usos.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en datasets de conducción y síntesis (KITTI, Sintel, FlyingThings, TartanAir), puede tener peor rendimiento en escenas no representadas (interiores, dominios médicos, animación estilizada).
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de producir flujo erróneo en regiones sin textura o con patrones repetitivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/sea-raft
- Código de la integración fastforks: https://github.com/kleinicke/fastforks
- Kernels para backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original SEA-RAFT: https://github.com/princeton-vl/SEA-RAFT (commit `9137517ba24e`)
- Pesos `sea-raft-m`: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH432x960-M
- Pesos `sea-raft-m-kitti`: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH-kitti432x960-M
- Pesos `sea-raft-m-spring`: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH-spring540x960-M
- Pesos `sea-raft-m-things`: https://huggingface.co/MemorySlices/Tartan-C-T432x960-M
- Pesos `sea-raft-s`: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH432x960-S
- Pesos `sea-raft-s-kitti`: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH-kitti432x960-S
- Pesos `sea-raft-s-spring`: https://huggingface.co/MemorySlices/Tartan-C-T-TSKH-spring540x960-S
- Hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/flow/models/sea_raft/card.toml
