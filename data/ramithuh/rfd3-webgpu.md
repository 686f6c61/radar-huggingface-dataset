# ramithuh/rfd3-webgpu

## Resumen

RFdiffusion3 WebGPU es una distribución de pesos del modelo RFdiffusion3 (RFD3), desarrollado por el Institute for Protein Design de la Universidad de Washington, empaquetada por el usuario ramithuh para su ejecución nativa en el navegador mediante WebGPU. RFdiffusion3 es un modelo de difusión para diseño biomolecular, orientado a la generación de estructuras de proteínas y complejos proteína-ligando. Esta variante concreta no introduce un modelo nuevo, sino una conversión de los pesos originales a safetensors fragmentados y optimizados para su carga en entornos web.

El repositorio ofrece dos precisiones: fp16, recomendada por defecto, con 14 fragmentos que suman 336,9 MB, y int8, opcional para escenarios de bajo ancho de banda, con 7 fragmentos que suman 170,4 MB. Cada fragmento se mantiene por debajo de 25 MB para facilitar su almacenamiento en caché del navegador y en OPFS (Origin Private File System). La precisión fp16 reproduce los resultados del modelo original en PyTorch CUDA FP32 con un RMSE de 0,305 Å sobre 50 pasos de difusión, lo que indica una fidelidad numérica alta para el proceso de generación estructural.

La relevancia de esta ficha radica en que habilita la inferencia de un modelo de diseño de proteínas de última generación directamente en el cliente, sin necesidad de infraestructura GPU en servidor. El repositorio tiene 0,5 GB de tamaño total, licencia BSD-3-Clause y no registra descargas ni likes en el momento de la consulta. No se dispone de información sobre el pipeline de Hugging Face ni sobre idiomas soportados, dado que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para diseño biomolecular (RFdiffusion3); detalles internos de la red no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión estructural, no de lenguaje) |
| Tipos de cuantizacion | fp16 (por defecto) e int8 (simétrica por fila en capas lineales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause (Copyright 2025, Institute for Protein Design, University of Washington) |
| Formato de pesos | safetensors fragmentados (`<sha256>.safetensors`) con `manifest.json` por precisión |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de RFdiffusion3 más allá de su naturaleza como modelo de difusión para diseño biomolecular. La model card indica que se trata de un port a WebGPU del modelo original RFdiffusion3 (RFD3) del Institute for Protein Design, y que los pesos empaquetados corresponden a la arquitectura upstream. No se especifican el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o estructuras utilizadas, ni si hubo etapas de ajuste fino con RLHF o DPO. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

Lo que sí se documenta con precisión es el proceso de empaquetado: los pesos se dividen en fragmentos de menos de 25 MB, cada uno identificado por su hash SHA-256, con un `manifest.json` que incluye los digests por fragmento, longitudes exactas en bytes, formas de los tensores, dtypes y constantes de máscara para la decodificación de la cabeza de secuencia. La conversión a fp16 mantiene una desviación de 0,305 Å RMSE frente a la ejecución en PyTorch CUDA FP32 sobre 50 pasos de difusión, y la variante int8 aplica cuantización simétrica por fila únicamente a los pesos de las capas lineales, reduciendo el tamaño de descarga aproximadamente a la mitad.

## Capacidades

- Diseño de proteínas mediante difusión: generación de estructuras proteicas a partir de condicionamientos, replicando el comportamiento del modelo RFdiffusion3 original.
- Diseño biomolecular: la model card menciona explícitamente el diseño biomolecular como ámbito de aplicación, lo que incluye complejos proteína-ligando según la descripción del modelo.
- Ejecución nativa en navegador mediante WebGPU, sin dependencia de servidores GPU.
- Carga de pesos verificada por SHA-256 con manifiesto por fragmento, lo que permite validar la integridad de cada descarga.
- Dos niveles de precisión seleccionables (fp16 e int8) para adaptar el consumo de ancho de banda y memoria.
- Almacenamiento en caché del navegador y OPFS gracias a la fragmentación en bloques de menos de 25 MB.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, ya que no es un modelo de lenguaje.

## Casos de uso

- Diseño de proteínas en el navegador para investigación docente: un estudiante o investigador puede ejecutar RFdiffusion3 directamente en una página web con WebGPU, sin instalar CUDA ni aprovisionar GPU en la nube, lo que facilita prácticas de diseño computacional de proteínas en entornos con recursos limitados.
- Prototipado rápido de candidatos estructurales: gracias a la variante fp16 de 336,9 MB, un equipo puede cargar los pesos en el cliente y generar propuestas iniciales de estructuras antes de escalar a la versión CUDA completa en servidor, reduciendo el ciclo de iteración temprano.
- Herramientas web de diseño biomolecular con privacidad de datos: al ejecutarse íntegramente en el navegador, las secuencias o condicionamientos del usuario no salen del dispositivo, lo que resulta adecuado para entornos con requisitos de confidencialidad sobre las consultas de diseño.
- Despliegue en escenarios de bajo ancho de banda: la variante int8 de 170,4 MB permite servir el modelo a usuarios con conexiones limitadas o en dispositivos móviles, manteniendo la verificación de integridad por hash en cada fragmento.
- Integración en cuadernos y demos interactivas: el formato fragmentado con manifiesto facilita la carga progresiva en aplicaciones web educativas o demos de denovo.run, mostrando el proceso de difusión paso a paso en el navegador.
- Validación de pipelines de inferencia web: desarrolladores que portan modelos científicos a WebGPU pueden usar este repositorio como referencia de empaquetado (fragmentos de menos de 25 MB, manifiesto con formas y dtypes, cuantización int8 por fila) para sus propias conversiones.
- Reproducibilidad de experimentos: la verificación SHA-256 por fragmento y la métrica de fidelidad (0,305 Å RMSE frente a FP32) permiten comparar resultados entre la ejecución web y la ejecución CUDA de referencia en estudios de validación.

## Benchmarks y rendimiento

La única métrica de rendimiento publicada en la información disponible es la fidelidad numérica de la conversión de precisión:

| Metrica | Valor |
|---|---|
| RMSE fp16 frente a PyTorch CUDA FP32 (50 pasos de difusión) | 0,305 Å |
| Tamano total fp16 (14 fragmentos + manifiesto) | 336.887.416 B (336,9 MB) |
| Tamano total int8 (7 fragmentos + manifiesto) | 170.394.484 B (170,4 MB) |
| Tamano maximo por fragmento | menos de 25 MB |

No se han publicado resultados de benchmarks de calidad de diseño estructural (por ejemplo, métricas de éxito de diseño, diversidad o novedad) en la información disponible. Tampoco se proporcionan datos de latencia o throughput en WebGPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, los pesos ocupan 336,9 MB en fp16 y 170,4 MB en int8, por lo que el consumo de memoria del dispositivo debe cubrir al menos esa cantidad más las activaciones y buffers intermedios del proceso de difusión, cuyo tamaño no se documenta.
- GPU recomendadas: no se especifican modelos concretos. El requisito es un navegador con soporte de WebGPU y una GPU compatible con dicha API.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño de los pesos, aunque no se confirma en la información disponible qué modelos concretos (por ejemplo, RTX 4090 o GPUs integradas) han sido validados.
- Opciones de despliegue: ejecución nativa en navegador mediante WebGPU, con los pesos servidos como safetensors fragmentados y cargados a través del manifiesto. No se documentan opciones de despliegue en servidor como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RFdiffusion3 WebGPU (este repositorio) | Difusión biomolecular, port WebGPU | no disponible | no aplica | BSD-3-Clause | Pesos safetensors fp16 e int8 en Hugging Face |
| RFdiffusion3 upstream (Institute for Protein Design) | Difusión biomolecular, PyTorch CUDA | no disponible | no aplica | BSD-3-Clause | Repositorio upstream citado en la model card |
| Otros modelos de diseño de proteínas | no disponible | no disponible | no aplica | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de RFdiffusion3 upstream ni de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa de calidad de diseño. La diferencia principal de este repositorio frente al upstream es el entorno de ejecución (WebGPU en navegador frente a PyTorch CUDA) y el empaquetado de pesos (safetensors fragmentados y cuantizados frente a los pesos originales).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; cualquier expectativa en ese sentido es incorrecta.
- No se documentan sesgos conocidos del modelo, pero al ser un modelo científico entrenado con datos estructurales, sus sesgos se manifestarían en la distribución de estructuras generadas y no están caracterizados en la información disponible.
- Riesgo de alucinación en sentido estricto no aplica, pero sí existe el riesgo de generar estructuras no viables biológicamente; la model card no documenta tasas de éxito ni validación experimental de los diseños.
- La fidelidad de la conversión se limita a la métrica publicada (0,305 Å RMSE en 50 pasos de difusión); no se documenta el comportamiento en otros regímenes de muestreo o condicionamientos.
- La cuantización int8 solo se aplica a pesos de capas lineales y no se detalla su impacto en la calidad de los diseños generados.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución; es necesario conservar el aviso de copyright del Institute for Protein Design y consultar `NOTICE` y `LICENSE-APACHE-2.0` para las dependencias de terceros.
- El repositorio no registra descargas ni likes, y su fecha de creación es posterior a la información de referencia habitual; conviene verificar su mantenimiento y procedencia antes de usarlo en producción.
- Dependencia de WebGPU: la inferencia requiere un navegador y una GPU compatibles; en entornos sin soporte de WebGPU el modelo no es ejecutable.
- No se dispone de información sobre el pipeline de Hugging Face ni sobre idiomas, lo que limita la integración con herramientas que esperan metadatos estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ramithuh/rfd3-webgpu
- Repositorio de modelos WebGPU (denovo-webgpu-models): https://github.com/ramithuh/denovo-webgpu-models/tree/main/models/rfd3
- Sitio denovo.run: https://denovo.run
- Institute for Protein Design, University of Washington: no se proporciona enlace directo en la información disponible
- Paper de RFdiffusion3: no disponible en la información proporcionada
