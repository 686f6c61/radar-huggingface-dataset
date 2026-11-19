# openbmb/MiniCPM-OCR-Jev-AWQ

## Resumen

MiniCPM-OCR-Jev-AWQ es la version cuantizada a 4 bits (AWQ W4A16) del modelo MiniCPM-OCR Jev, desarrollado por OpenBMB. Se trata de un modelo multimodal de 2B parametros especializado en la evaluacion de calidad de resultados OCR: dada una imagen de region de documento (texto, formula o tabla) y un resultado OCR candidato, devuelve una puntuacion entre 0 y 1 que indica la probabilidad de que dicho candidato sea correcto. No genera texto libre, sino que actua como clasificador binario de calidad.

El modelo se entrena a partir de Qwen3.5-2B, conservando el codificador visual y el backbone de lenguaje, pero sustituyendo la cabeza de salida `lm_head` por una cabeza de clasificacion binaria. Esta version AWQ reduce el peso del repositorio a 2,4 GB, lo que facilita su despliegue en hardware modesto manteniendo el pipeline `image-text-to-text` de transformers.

Su relevancia actual radica en que permite automatizar el filtrado de resultados OCR en pipelines de digitalizacion documental: los candidatos con puntuacion alta se aceptan automaticamente y el resto se derivan a revision humana, o bien se usa para seleccionar el mejor resultado entre varios motores OCR (best-of-N). Con solo 2B parametros, alcanza un AUROC de decision de 93,6 en JevOCRBench, superando a modelos mucho mayores como JEV-35B-A3B (90,1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B con cabeza de clasificacion binaria) |
| Parametros totales | 2.213.245.760 (aproximadamente 2,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 (4 bits, compressed-tensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y conserva tanto el codificador visual como el backbone de lenguaje. La innovacion principal es la sustitucion de la cabeza de generacion de tokens (`lm_head`) por una cabeza de clasificacion binaria que aprende a discriminar si un candidato OCR es correcto o incorrecto. La unidad de evaluacion es una region de documento (texto, formula o tabla) junto con su resultado OCR candidato; la entrada combina la imagen original del recorte y el contenido candidato (texto OCR y una imagen renderizada a partir de ese texto).

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se evalua sobre JevOCRBench, un benchmark propio de OpenBMB para evaluacion de calidad OCR. La version AWQ aplica cuantizacion post-entrenamiento de activaciones y pesos (W4A16) mediante compressed-tensors, sin cambios en la arquitectura.

## Capacidades

- Evaluacion de calidad OCR: devuelve una puntuacion de 0 a 1 para un candidato OCR dado, indicando la probabilidad de que sea correcto.
- Soporte de tres categorias de region: texto, formula y tabla.
- Entrada multimodal: imagen del recorte original mas texto candidato (y opcionalmente imagen renderizada del candidato).
- Seleccion best-of-N: permite puntuar multiples candidatos para una misma region y escoger el de mayor puntuacion.
- Filtrado automatico: umbral configurable para aceptar resultados de forma automatica y derivar el resto a revision humana.
- Capacidades multilingues limitadas a ingles y chino.
- No es un modelo generativo: no produce texto libre ni soporta tool calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision general, audio ni capacidades de agente.

## Casos de uso

- Digitalizacion masiva de documentos legales: puntuar cada region parseada y aceptar automaticamente las que superen un umbral, reduciendo la carga de revision humana en funcion del nivel de precision exigido.
- Procesamiento de recibos y facturas financieras: evaluar la calidad de la extraccion de campos en recibos complejos y derivar a revision solo los casos dudosos, mejorando el ratio de aceptacion sin supervision.
- Seleccion del mejor motor OCR en produccion: ejecutar varios motores (MiniCPM-OCR 1.0, GLM-OCR, PaddleOCR-VL, Xiaomi-OCR) sobre la misma segmentacion y usar Jev para escoger el candidato con mayor puntuacion por region.
- Control de calidad en pipelines de extraccion de formulas cientificas: puntuar la transcripcion de formulas matematicas y detectar errores de renderizado o simbolos mal reconocidos antes de publicar.
- Extraccion de tablas en informes financieros: evaluar la fidelidad de la reconstruccion de tablas y marcar para revision humana las celdas o regiones con baja confianza.
- Enrutamiento inteligente en plataformas de gestion documental: integrar el modelo como paso de triaje que decide entre aceptacion automatica, reintento con otro motor o escalado a un operador humano.
- Monitorizacion de deriva en sistemas OCR existentes: puntuar periodicamente muestras de produccion para detectar degradacion en la calidad de extraccion y disparar alertas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JevOCRBench (AUROC x100, mayor es mejor):

| Modelo | AUROC (x100) |
|---|---:|
| MiniCPM-OCR Jev (2B) | 93,6 |
| JEV-35B-A3B | 90,1 |
| Qwen3.5-397B-A17B | 93,8 |

Discriminacion por motor OCR evaluado (misma muestra de 200 ejemplos, AUROC x100):

| Motor OCR | AUROC (x100) |
|---|---:|
| MiniCPM-OCR 1.0 | 92,7 |
| GLM-OCR | 91,9 |
| PaddleOCR-VL-1.6 | 93,4 |
| Xiaomi-OCR-0 | 93,1 |

La diferencia maxima entre motores es de 1,5 puntos, lo que indica una generalizacion estable. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con pesos AWQ de 4 bits (el repositorio pesa 2,4 GB), mas overhead de activaciones y del codificador visual.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090); tambien A100 y H100 para despliegues de alto throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers con soporte de compressed-tensors, vLLM (si soporta la arquitectura qwen3_5 y AWQ), servicio Docker/SDK de OpenBMB y API en la nube.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | AUROC (x100) | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| MiniCPM-OCR-Jev-AWQ | 2,2B | Evaluador OCR (clasificacion) | 93,6 | Apache 2.0 | Hugging Face |
| JEV-35B-A3B | 35B (3B activos, MoE) | Evaluador OCR | 90,1 | no disponible | no disponible |
| Qwen3.5-397B-A17B | 397B (17B activos, MoE) | Modelo generalista | 93,8 | no disponible | no disponible |

La comparativa se limita a los datos publicados en la model card. MiniCPM-OCR-Jev-AWQ ofrece un rendimiento casi identico al modelo generalista mas grande (93,6 frente a 93,8) con dos ordenes de magnitud menos de parametros, y supera al evaluador especializado JEV-35B-A3B.

## Limitaciones y advertencias

- Solo soporta ingles y chino; otros idiomas no estan cubiertos oficialmente.
- No es un modelo generativo: no puede transcribir texto, solo puntuar candidatos existentes.
- La calidad de la seleccion best-of-N esta acotada por la cobertura y correccion de los candidatos disponibles; no puede mejorar un resultado que ningun motor haya producido correctamente.
- Los candidatos para una misma region deben compartir el recorte y los limites de contenido para que la comparacion sea valida.
- La eleccion del umbral afecta al equilibrio entre aceptacion automatica y volumen de revision humana; requiere calibracion con muestras de la aplicacion concreta.
- Riesgo de alucinacion no aplica en el sentido generativo, pero puede haber falsos positivos en la clasificacion de candidatos correctos.
- No se dispone de informacion sobre sesgos especificos del modelo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B.
- La version AWQ puede presentar pequenas diferencias de precision frente a los pesos BF16 originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-AWQ
- Modelo base (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_api_en.md
- Dataset de evaluacion JevOCRBench: https://huggingface.co/datasets/openbmb/JevOCRBench
