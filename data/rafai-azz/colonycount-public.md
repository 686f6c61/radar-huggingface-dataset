# rafai-azz/colonycount-public

## Resumen

colonycount-public es un paquete de pesos ONNX publicado por rafai-azz para colonycount, una herramienta de código abierto de recuento de colonias bacterianas en placas de agar. No se trata de un modelo único, sino de tres detectores de objetos empaquetados conjuntamente: RF-DETR nano (27,2 M de parámetros, modelo por defecto), YOLOX-Tiny (5,0 M) y YOLOX-M (25,3 M). Los tres se distribuyen en formato ONNX y se ejecutan sobre imágenes de placa, devolviendo cajas delimitadoras y puntuaciones de confianza que la librería agrega mediante NMS por teselas.

El modelo resuelve un problema acotado y bien definido: contar colonias en fotografías de placas de cultivo con precisión cercana a la del recuento humano. Los pesos se han ajustado fino (fine-tuning) a partir de pesos preentrenados en COCO, usando la unión de dos conjuntos de datos públicos con licencia CC BY 4.0: un conjunto de fotografías de smartphone (figshare 22022540) y un conjunto clínico de alta resolución (Zenodo 18256864). El resultado es un MdAPE (error porcentual absoluto mediano) del 1,06 % en el conjunto de test para el modelo por defecto.

La relevancia actual es doble. Por un lado, demuestra que es posible obtener precisión de laboratorio con modelos pequeños (5-27 M de parámetros) que corren en CPU, lo que abarata el despliegue en entornos de microbiología con hardware modesto. Por otro, la publicación es transparente en lo que respecta a datos, particiones, umbrales y métricas, algo poco habitual en herramientas de este tipo. El paquete está en fase de prelanzamiento (v0.1, aún no en PyPI) y el repositorio pesa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres detectores: RF-DETR nano (transformer DETR), YOLOX-Tiny y YOLOX-M (CNN anchor-free) |
| Parametros totales | 27,2 M (rfdetr-nano); 5,0 M (yolox-tiny); 25,3 M (yolox-m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen `[1, 3, T, T]`) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC BY 4.0 (pesos); Apache-2.0 (código de colonycount y de los modelos base) |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

Los tres modelos comparten un mismo pipeline de inferencia, pero difieren en su arquitectura interna. RF-DETR nano es un detector basado en transformer (familia DETR) de Roboflow, con 27,2 M de parámetros, ajustado fino desde los pesos preentrenados en COCO de `rfdetr==1.12.1`. YOLOX-Tiny y YOLOX-M son detectores convolucionales anchor-free de Megvii, con 5,0 M y 25,3 M de parámetros respectivamente, ajustados desde `yolox_tiny.pth` y `yolox_m.pth` de la versión 0.1.1rc0. El código base de YOLOX está vendorizado en el commit `6ddff4824372906469a7fae2dc3206c7aa4bbaee`.

El entrenamiento se realizó sobre la unión de dos conjuntos de datos públicos. El primero, de Solymosi y Nagy (2023), contiene fotografías de placas tomadas con smartphone y anotaciones COCO; el segundo, de Du (2026), contiene imágenes clínicas de alta resolución de 19 especies bacterianas. En ambos casos se aplicó una partición 70/15/15 (entrenamiento/validación/test) estratificada por especie o aislado con semilla fija. No se usaron los ficheros aumentados del conjunto clínico. Los umbrales de puntuación por defecto (0,40 para rfdetr-nano, 0,50 para yolox-tiny, 0,35 para yolox-m) se fijaron sobre el split de validación el 2026-11-15. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión.

La innovación técnica destacable no está en la arquitectura, sino en el contrato de inferencia: el paquete tesela la placa, ejecuta el detector sobre cada tesela, fusiona las detecciones con NMS y aplica el umbral. El tamaño de tesela `T` se lee del propio modelo ONNX, y la salida es `boxes` `[N, 4]` en píxeles de tesela (xyxy) más `scores` `[N]`. Los pesos se verifican contra un SHA-256 fijado antes de cachearse.

## Capacidades

- Detección de objetos: localización de colonias bacterianas individuales sobre imágenes de placas de agar, con cajas delimitadoras y puntuaciones de confianza.
- Recuento agregado de colonias por placa mediante fusión de teselas con NMS.
- Tres perfiles de rendimiento/precisión intercambiables (`rfdetr-nano`, `yolox-tiny`, `yolox-m`).
- Ejecución en CPU: los tres modelos están exportados a ONNX y no requieren GPU.
- Procesamiento de dos dominios de imagen distintos: fotografías de smartphone y placas clínicas de alta resolución.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, texto, visión general, audio ni modo thinking. Es exclusivamente un detector de colonias.
- Capacidades multilingües: no aplica (no procesa lenguaje).

## Casos de uso

- Recuento automatizado en laboratorio de microbiología: el paquete procesa una fotografía de placa y devuelve el número de colonias con un MdAPE del 1,06 % (rfdetr-nano) en el conjunto de test, lo que permite sustituir el recuento manual en rutinas de control de calidad.
- Triaje en entornos con hardware modesto: `yolox-tiny` corre a 1,3 s por placa en CPU (split de validación), lo que lo hace adecuado para portátiles o mini-PC sin GPU en laboratorios de campo o clínicas pequeñas.
- Procesamiento por lotes de placas clínicas: `yolox-m` ofrece el mejor MdAPE en test (0,92 %) con 4,5 s por placa en CPU, adecuado para digitalizar archivos de placas clínicas de alta resolución (142 de las 192 placas de test son clínicas).
- Integración en pipelines de laboratorio: al ser ONNX con un contrato de entrada/salida bien definido (`images` float32 `[1, 3, T, T]`, `boxes`, `scores`), puede insertarse en flujos existentes de captura y análisis de imágenes sin dependencia de frameworks de deep learning pesados.
- Investigación en microbiología: permite reproducir experimentos de recuento con umbrales y particiones documentados, y comparar los tres detectores bajo las mismas condiciones.
- Docencia y formación: la herramienta de línea de comandos (`colonycount --model rfdetr-nano plate.jpg`) permite demostrar el recuento automatizado en prácticas de microbiología sin infraestructura especializada.
- Verificación de calidad en producción de medios de cultivo: el recuento rápido de placas de control permite detectar desviaciones en lotes de agar antes de su uso rutinario.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. MdAPE es el error porcentual absoluto mediano en placas con 30-300 colonias verdaderas; MAE es el error absoluto medio en colonias por placa; sesgo es predicho menos verdadero.

**Split de test** (192 placas: 142 clínicas, 50 de smartphone; nunca usado para entrenamiento ni selección; ejecutado una sola vez):

| Modelo | MdAPE (30-300) | MAE | Precision | Recall |
|---|---|---|---|---|
| rfdetr-nano | 1,06 % | 1,06 | 98,3 % | 98,2 % |
| yolox-tiny | 1,45 % | 1,84 | 98,5 % | 97,1 % |
| yolox-m | 0,92 % | 1,04 | 98,1 % | 98,1 % |

**Split de validación** (198 placas: 142 clínicas, 56 de smartphone; los umbrales se eligieron aquí, por lo que son optimistas):

| Modelo | MdAPE (30-300) | MAE | Precision | Recall | CPU s/placa |
|---|---|---|---|---|---|
| rfdetr-nano | 0,75 % | 3,52 | 97,4 % | 97,2 % | 8,7 |
| yolox-tiny | 0,96 % | 4,31 | 97,5 % | 96,0 % | 1,3 |
| yolox-m | 1,05 % | 4,45 | 97,1 % | 96,6 % | 4,5 |

Notas del autor: `yolox-tiny` es débil en fotografías de smartphone (MdAPE 4,42 % en test, subrecuento de 4,5 colonias por placa; en placas clínicas, 0,46 %). El split de test no contiene placas con más de 300 colonias (validación: 12), por lo que el MAE de test es inferior al de validación; la comparación correcta es por MdAPE. Los tiempos de CPU de test fueron un 20-40 % superiores a los de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; los modelos están exportados a ONNX y el autor reporta tiempos en CPU, no en GPU. Por tamaño (5-27,2 M de parámetros), la huella en memoria es mínima (del orden de decenas de MB en float32).
- GPU recomendadas: no disponibles en la información proporcionada. El autor no publica requisitos ni tiempos de GPU.
- Cabe en GPU de consumo: sí, con cualquier GPU moderna, dado el tamaño reducido de los tres modelos, aunque no se han publicado mediciones.
- Opciones de despliegue: ONNX Runtime (formato nativo de los pesos); el paquete colonycount los descarga y verifica automáticamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: en CPU, 1,3 s/placa (yolox-tiny), 4,5 s/placa (yolox-m) y 8,7 s/placa (rfdetr-nano) en el split de validación, procesando una placa a la vez. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | MdAPE test (30-300) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| colonycount rfdetr-nano | 27,2 M | imagen `[1, 3, T, T]` | 1,06 % | CC BY 4.0 (pesos) | ONNX en Hugging Face |
| colonycount yolox-m | 25,3 M | imagen `[1, 3, T, T]` | 0,92 % | CC BY 4.0 (pesos) | ONNX en Hugging Face |
| colonycount yolox-tiny | 5,0 M | imagen `[1, 3, T, T]` | 1,45 % | CC BY 4.0 (pesos) | ONNX en Hugging Face |
| RF-DETR nano (base Roboflow) | 27,2 M | imagen | no disponible | Apache-2.0 | Hugging Face / Roboflow |
| YOLOX-Tiny (base Megvii) | 5,0 M | imagen | no disponible | Apache-2.0 | GitHub Megvii |

No se dispone en la información proporcionada de otros detectores de colonias comparables con métricas publicadas sobre los mismos conjuntos de datos. La comparativa se limita, por tanto, a los tres modelos del propio paquete y a sus modelos base preentrenados en COCO, para los que no se reportan métricas de recuento de colonias.

## Limitaciones y advertencias

- Herramienta de ayuda al recuento para investigación y laboratorio; no es un dispositivo diagnóstico ni debe usarse para decisiones clínicas.
- Las placas con más de 300 colonias (TNTC, too numerous to count) se subrecuentan: el autor reporta un sesgo de aproximadamente -8 colonias en esas placas para rfdetr-nano en validación. El split de test no contiene ninguna placa de ese tipo.
- La precisión se midió únicamente sobre los dos conjuntos de datos citados (fotografías de smartphone y placas clínicas de alta resolución); otros medios, iluminaciones o configuraciones de imagen no están validados.
- `yolox-tiny` presenta un rendimiento claramente inferior en fotografías de smartphone (MdAPE 4,42 % en test, subrecuento de 4,5 colonias por placa), por lo que no es adecuado para ese dominio sin revalidación.
- Los umbrales por defecto se fijaron sobre el split de validación, por lo que las métricas de validación son optimistas; las de test son la referencia.
- Riesgo de alucinación: en un detector de objetos se traduce en falsos positivos y falsos negativos; las precisiones y recalls reportados (97-98,5 %) implican que entre el 1,5 % y el 3 % de las detecciones son erróneas en los conjuntos evaluados.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución a colonycount y a los dos conjuntos de datos. El código de colonycount es Apache-2.0.
- El paquete está en prelanzamiento (v0.1, no en PyPI); la instalación requiere compilar desde el código fuente y la interfaz puede cambiar.
- Sesgos conocidos: no se documentan sesgos por especie bacteriana, tipo de medio ni condiciones de iluminación más allá de las limitaciones de dominio mencionadas.
- No se han publicado resultados de benchmarks en la información disponible más allá de los reportados por el propio autor en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafai-azz/colonycount-public
- Repositorio colonycount: https://github.com/rafaliazz/colonycount
- Informe completo de resultados: https://github.com/rafaliazz/colonycount/blob/main/results/README.md
- Dataset smartphone (figshare): https://doi.org/10.6084/m9.figshare.22022540.v3
- Paper del dataset smartphone: https://doi.org/10.1038/s41597-023-02404-8
- Dataset clínico (Zenodo): https://doi.org/10.5281/zenodo.18256864
- Paper del dataset clínico: https://doi.org/10.1038/s41597-026-07095-5
- RF-DETR (Roboflow): no disponible en la información proporcionada
- YOLOX (Megvii): no disponible en la información proporcionada
