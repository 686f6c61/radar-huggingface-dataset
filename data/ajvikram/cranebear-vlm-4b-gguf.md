# ajvikram/cranebear-vlm-4b-gguf

## Resumen

CraneBear VLM 4B es un ajuste fino LoRA del modelo multimodal Qwen3-VL-4B-Instruct, desarrollado por ajvikram, que convierte una transcripción de voz de emergencia (con una foto opcional) en un objeto JSON de extracción con siete claves, diseñado para asistir a un despachador humano. El modelo no realiza triaje ni despacho: solo extrae evidencia etiquetada por severidad (MINOR, DELAYED, IMMEDIATE, DECEASED) y otros campos estructurados, dejando la decisión final a un operador entrenado.

Se distribuye como dos checkpoints GGUF en cuantización Q4_K_M (texto) más un proyector multimodal en f16, pensado para ejecutarse en llama.cpp, llama-server o la ruta iOS mtmd. El checkpoint r2 (solo texto) alcanza un 93,8% de macro-F1 en un conjunto de validación de 24 casos con 0% de IMMEDIATE no detectados; el r3 (texto + foto) obtiene un 91,7% con el mismo criterio. El modelo está pensado para despliegue en el borde (edge AI) y su licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3-VL-4B-Instruct, con encoder de vision congelado y LoRA r=16 en la torre de lenguaje |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion de servicio en llama-server) |
| Tipos de cuantizacion | Q4_K_M (texto), f16 (proyector multimodal) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) y mmproj f16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal con encoder de vision y torre de lenguaje. El ajuste fino aplica LoRA con rango 16 únicamente sobre la torre de lenguaje, manteniendo congelado el encoder de vision. El entrenamiento se realizó en dos fases: r2 con 800 filas de texto (esquema del socio, codificado por presencia) durante 4 épocas (~3,4 horas), y r3 que añade 1.018 pares (transcripción, foto) generados a partir de 880 fotos de Wikimedia Commons con etiquetas deterministas derivadas de las categorías y cuatro reglas fijas (una foto puede añadir un peligro, nunca restarlo, la evidencia solo-foto nunca es HIGH, una foto irrelevante no cambia nada). No se usó un modelo profesor para las etiquetas. El proyector multimodal (mmproj) es idéntico al del modelo base (torre congelada). El entrenamiento se ejecutó en una NVIDIA DGX Spark (GB10) y se aplicó early stopping sobre la pérdida de validación.

## Capacidades

- Extracción de información estructurada en JSON a partir de transcripciones de voz de emergencias (7 claves: severidad, peligros, recuento de víctimas, etc.).
- Procesamiento de imágenes opcional: puede leer peligros de una foto (por ejemplo, humo, escombros) y combinarlos con la transcripción.
- Salida restringida por gramática GBNF (`cranebear-extraction-presence.gbnf`) que garantiza un objeto con presencia codificada (sin nulos).
- Soporte de decodificación greedy (temperatura 0) para máxima determinismo.
- No incluye modo de pensamiento (no hay bloque "think" en la plantilla).
- No soporta tool calling ni agentes multi-paso; su función es exclusivamente extracción de evidencia.
- Multilingüe: no, solo inglés.

## Casos de uso

- Centro de llamadas de emergencia: el modelo procesa la transcripción de una llamada de pánico y genera un resumen estructurado (severidad, peligros, víctimas) que el despachador revisa antes de enviar recursos.
- Asistencia a despachadores en campo: un operador puede adjuntar una foto del incidente (por ejemplo, un accidente de tráfico) y el modelo la integra con la transcripción para enriquecer el informe.
- Documentación automatizada de incidentes: genera automáticamente el registro JSON de cada llamada, reduciendo el trabajo manual de los operadores.
- Integración en sistemas de triaje previo: como capa de extracción antes de un sistema de decisión humano, sin automatizar el envío de ambulancias ni bomberos.
- Evaluación de calidad de llamadas: comparar las extracciones del modelo con las anotaciones humanas para detectar sesgos o errores en la comunicación.
- Despliegue en el borde (edge AI): al ser un GGUF de 2,5 GB, puede ejecutarse en hardware modesto (portátiles, mini-PCs) para entornos con conectividad limitada, como ambulancias o puestos de mando móviles.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor proporciona métricas sobre conjuntos de evaluación propios, que se resumen a continuación:

| Conjunto | Checkpoint | Macro-F1 | Missed-IMMEDIATE | Notas |
|---|---|---|---|---|
| 24 casos (solo texto, del socio) | vlm-v2-r2 | 93,8% | 0% | raw 92,7% |
| 24 casos (solo texto, del socio) | vlm-v2-r3 | 91,7% | 0% | raw 88,5% |
| 60 casos (foto, etiquetas propuestas) | vlm-v2-r3 | no disponible | 1 caso | 7/7 en foto-adds, 14/18 ignora fotos irrelevantes, false-IMMEDIATE 3/16 |

Estos números se obtuvieron con llama.cpp en un Mac y son consistentes entre llama-server y la ruta Swift/mtmd. No hay datos de latencia ni throughput publicados.

## Requisitos de hardware

- VRAM estimada: el checkpoint de texto Q4_K_M ocupa 2,5 GB; el proyector multimodal f16, 839 MB. Con overhead de ejecución, se estima un uso total de 4-5 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, M1/M2/M3 de Apple). No se ha probado en GPUs de gama alta, pero debería funcionar en A100/H100 con margen amplio.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 6 GB o más.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (mediante Modelfiles incluidos), y la ruta iOS mtmd (aunque el autor advierte que no se debe ejecutar en un teléfono para producción).
- Latencia y throughput: no disponibles; el autor solo indica que los números se obtuvieron en un Mac con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CraneBear VLM 4B (este) | 4B | 4096 | Extracción JSON de emergencias (texto + foto) | Apache 2.0 | GGUF en HF |
| Qwen3-VL-4B-Instruct (base) | 4B | 32k (nativo) | Multimodal general (chat, visión, razonamiento) | Apache 2.0 | Safetensors, GGUF |
| cranebear-extraction-4b (texto, del socio) | 4B | no disponible | Extracción JSON de emergencias (solo texto) | no disponible | no público |

La comparativa se limita a características porque no hay benchmarks estándar compartidos. El modelo base Qwen3-VL-4B-Instruct ofrece mayor contexto y capacidades generales, pero no está especializado en el dominio de emergencias. El modelo del socio (cranebear-extraction-4b) es el referente de producción, con el que CraneBear VLM 4B compite en rendimiento (91,7% vs 91,7% en el conjunto de 24 casos).

## Limitaciones y advertencias

- El uso con fotos no está validado para producción: el conjunto de evaluación de 60 casos tiene etiquetas propuestas no ratificadas y solo 34 fotos con fuente. El checkpoint r3 aún presenta 1 caso de IMMEDIATE no detectado y 2 casos de confianza HIGH solo-foto.
- El modelo no debe ejecutarse en un teléfono; todos los números se obtuvieron con llama.cpp en un Mac.
- No se ha entrenado para reconocer signos de regla 1 (persona bajo escombros) ni recuento de víctimas a partir de fotos, por falta de conjuntos de imágenes éticos.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información si la transcripción es ambigua; la gramática GBNF reduce pero no elimina este riesgo.
- Sesgos: el entrenamiento se basa en transcripciones y fotos de dominio específico (emergencias), lo que puede limitar su generalización a otros contextos.
- Solo soporta inglés; no hay soporte multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de precisión ni soporte para despliegues críticos.
- El merge recomendado (texto primero, luego foto) es una guarda del lado del llamador, no está dentro de los pesos; debe implementarse en el consumidor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ajvikram/cranebear-vlm-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- No se han encontrado otros enlaces públicos (papers, blogs, repos) en la búsqueda web.
