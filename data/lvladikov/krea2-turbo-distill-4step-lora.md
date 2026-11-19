# lvladikov/Krea2-Turbo-Distill-4step-LoRA

## Resumen

Krea2-Turbo-Distill-4step-LoRA es un adaptador LoRA de destilación de pasos publicado por el usuario lvladikov para el modelo de texto a imagen Krea 2 Turbo (krea/Krea-2-Turbo). Su función es reducir el número mínimo de pasos de denoising utilizables de 8 a 4, manteniendo la fidelidad de textura fina del modelo profesor de 8 pasos. No es un modelo autónomo: requiere cargarse sobre Krea 2 Turbo y emplea los sigmas propios del modelo base, sin sampler parcheado ni nodos personalizados.

El adaptador se distribuye en dos ficheros de pesos equivalentes (formato diffusers y formato ComfyUI), ambos con rango 64, junto con un workflow de ComfyUI listo para usar. El repositorio ocupa 16,5 GB e incluye el checkpoint chk00133000, que sustituye a la primera release final (chk00078000). Según el autor, el entrenamiento acumula 133.000 muestras, 91.044 trayectorias de 8 pasos del profesor y 13 resoluciones entrenadas de hasta 1824×1024.

La relevancia práctica está en el coste de inferencia: pasar de 8 a 4 pasos supone aproximadamente 1,6× de aceleración extremo a extremo a 1024×1024 (54,5 s frente a 88,7 s, incluyendo carga del modelo, codificación de texto y decodificación VAE) y 1,8× si solo se mide el denoising. Está pensado para despliegues de generación de imágenes donde la latencia importa y la textura fina no puede degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusión de Krea 2 Turbo |
| Parametros totales | no disponible (rango 64; el número de parámetros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no aplica ventana de contexto de tokens de texto) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors y el ejemplo de uso carga en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (Other) |
| Formato de pesos | safetensors (dos variantes: claves diffusers y claves ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 que se inyecta en el transformer del modelo base Krea 2 Turbo. La destilación se realiza sobre las propias trayectorias de 8 pasos del profesor: cada prompt se registra como una trayectoria completa de 8 pasos y el adaptador aprende a reproducir el resultado con 4 pasos sobre los sigmas de despliegue originales de Turbo. El autor indica 13.750 prompts procedentes del dataset de 3 millones de prompts de Lakonik, lo que genera 91.044 "acordes" de entrenamiento sobre las rutas de 8 pasos, y 133.000 muestras totales en los pesos publicados (1,7× la primera release, de 78.000).

El entrenamiento incorpora puntuación de crítico contra el prompt (prompt-aware training) y, desde la primera release, cinco cabezas de crítico en lugar de una. Se cubren 13 resoluciones multi-aspecto, desde 512×512 hasta 1440×1440, más 1824×1024. El conjunto de imágenes reales empleado por el crítico incluye 43.044 recortes de fotografías (25.560 de LSDIR y 17.484 de Flickr2K), de los cuales 5.234 recortes de fotos 4K se añadieron tras la primera release. El coste declarado fue de 21 días en una única RTX 3090 hasta la primera release y, posteriormente, cerca de un día en una H200 y dos días más en la RTX 3090.

## Capacidades

- Generación de imágenes texto a imagen sobre Krea 2 Turbo con 4 pasos de denoising en lugar de 8.
- Restauración de textura fina que se pierde en la inferencia a 4 pasos del modelo base: energía de textura fina a 0,96× la del profesor en promedio sobre 12 tamaños y 1,01–1,04× a 1440 px.
- Control de patrones de rejilla de 8 y 16 píxeles en 0,96–0,98× respecto al profesor, y grano en zonas planas a 0,99×.
- Reducción de ghosting y bordes duplicados: más cercano al profesor en 10 de 12 tamaños en ambas métricas.
- Ajuste de saturación equivalente al profesor (1,00×).
- Soporte de 13 resoluciones entrenadas, incluidas 512×512, 1440×1440 y 1824×1024.
- Compatibilidad directa con diffusers y ComfyUI mediante pesos LoRA estándar, sin nodos personalizados ni sampler modificado.
- Intensidad del adaptador ajustable de forma continua; el autor recomienda 0,75 como segunda configuración y un rango de 0,6–0,9.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un adaptador de generación de imágenes.

## Casos de uso

- Generación de imágenes en producción con latencia reducida: usar 4 pasos en lugar de 8 recorta el tiempo extremo a extremo a 54,5 s frente a 88,7 s a 1024×1024, incluyendo carga de modelo, codificación de texto y decodificación VAE, lo que permite más peticiones por GPU en el mismo intervalo.
- Prototipado rápido de conceptos visuales: con 1,8× de aceleración solo en denoising, un equipo de diseño puede iterar sobre variaciones de un prompt en menos tiempo y con textura fina comparable al profesor de 8 pasos.
- Renderizado de gran formato: el adaptador mantiene la textura fina en 1,01–1,04× la del profesor a 1440 px y evita el sobreenfoque que la primera release mostraba a tamaños grandes, lo que lo hace adecuado para piezas de 1824×1024.
- Integración en ComfyUI: el repositorio incluye un workflow JSON con nodos estándar y pesos con claves ComfyUI, de modo que un pipeline existente puede adoptar el adaptador sin desarrollo adicional.
- Tuberías en diffusers: el ejemplo de la model card carga el LoRA sobre Krea2Pipeline con bfloat16 y guidance_scale=0.0, lo que permite incorporarlo a servicios Python existentes sin cambiar el sampler.
- Generación de material gráfico con control de intensidad: en estilos ilustrados o piezas de alto contraste donde la restauración de textura resulta excesiva a fuerza 1,0, se puede bajar a 0,75 o al rango 0,6–0,9 para equilibrar detalle y estilo.
- Evaluación comparativa de calidad: útil como referencia para medir la pérdida de textura al reducir pasos, ya que el autor publica métricas relativas al profesor de 8 pasos sobre 15 prompts y 12 tamaños.

## Benchmarks y rendimiento

| Metrica | Resultado (relativo al profesor de 8 pasos) |
|---|---|
| Energia de textura fina, promedio sobre 12 tamanos | 0,96× |
| Energia de textura fina a 1440 px | 1,01–1,04× |
| Patrones de rejilla de 8 y 16 px | 0,96–0,98× |
| Grano en zonas planas | 0,99× |
| Saturacion | 1,00× |
| Ghosting y bordes duplicados | mas cercano al profesor en 10 de 12 tamanos |
| Tiempo extremo a extremo a 1024×1024 (4 pasos) | 54,5 s (frente a 88,7 s con 8 pasos) |
| Aceleracion extremo a extremo | ~1,6× |
| Aceleracion solo en denoising | 1,8× |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores son comparativas internas del autor frente al modelo profesor.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero, pero requiere cargar el modelo base Krea 2 Turbo en memoria; el repositorio del adaptador ocupa 16,5 GB, aunque los pesos LoRA son una fracción de ese tamaño.
- El ejemplo oficial carga el pipeline en bfloat16 sobre CUDA; no se especifica la VRAM exacta necesaria para Krea 2 Turbo.
- GPU recomendadas: el autor entrenó en RTX 3090 y H200, lo que indica que la inferencia es viable en GPU de consumo de gama alta y en aceleradores de datacenter.
- Cabe en GPU de consumo: el entrenamiento se completó en una RTX 3090, por lo que la inferencia con el adaptador es posible en esa clase de tarjeta; no se detallan requisitos para modelos inferiores.
- Opciones de despliegue: diffusers (Krea2Pipeline con load_lora_weights) y ComfyUI (pesos con claves ComfyUI y workflow JSON incluido). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: 54,5 s por imagen a 1024×1024 con 4 pasos en el entorno medido por el autor, frente a 88,7 s con 8 pasos; no se especifica la GPU empleada en esa medición.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2-Turbo-Distill-4step-LoRA (este) | LoRA de destilacion sobre Krea 2 Turbo | 4 | 13 resoluciones hasta 1824×1024 | krea-2-community-license | Hugging Face, diffusers y ComfyUI |
| Krea2-Turbo-Distill-3step-LoRA | LoRA de destilacion sobre Krea 2 Turbo | 3 | no disponible | no disponible | Hugging Face (lvladikov) |
| Krea 2 Turbo (base) | Modelo de texto a imagen | 8 | no disponible | krea-2-community-license | Hugging Face (krea/Krea-2-Turbo) |

El autor indica que la variante de 3 pasos reduce el tiempo de denoising a tres cuartas partes del de este LoRA y ofrece más detalle fino (textura fina 1,26× la del profesor de 8 pasos en sus 22 prompts de prueba), mientras que este LoRA de 4 pasos es el que más se aproxima a las imágenes de 8 pasos de Turbo. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como adaptador sobre krea/Krea-2-Turbo y no puede usarse sin el modelo base.
- A fuerza 1,0 la restauración de textura puede resultar excesiva en arte estilizado, piezas de alto contraste o renders muy grandes; el autor recomienda 0,75 o el rango 0,6–0,9.
- La textura fina es algo más suave que la de la primera release en tamaños medios, según reconoce el propio autor.
- Licencia krea-2-community-license: es una licencia "other" con términos específicos recogidos en LICENSE.pdf; deben revisarse antes de cualquier uso comercial. El repositorio incluye NOTICE.txt con la atribución obligatoria.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas; al ser un modelo de imagen, el riesgo de alucinación se traduce en fidelidad al prompt, no evaluada en la información disponible.
- Las métricas publicadas son comparativas internas del autor frente al profesor de 8 pasos, no benchmarks independientes ni comparaciones con otros modelos.
- El adaptador está entrenado para 13 resoluciones concretas; no se garantiza el comportamiento fuera de ese conjunto.
- El checkpoint publicado (chk00133000) sustituye a la primera release; la versión anterior queda archivada en `_archive/checkpoints/`, lo que puede afectar a la reproducibilidad de resultados previos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- LoRA de 3 pasos del mismo autor: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-3step-LoRA
- Dataset de prompts de Lakonik: https://huggingface.co/datasets/Lakonik/t2i-prompts-3m
- Licencia (PDF): https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA/blob/main/LICENSE.pdf
- Diffusers: https://github.com/huggingface/diffusers
