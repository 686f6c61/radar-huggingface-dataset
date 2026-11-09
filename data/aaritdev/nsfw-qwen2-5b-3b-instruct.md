# aaritdev/NSFW-Qwen2.5b-3b-instruct

## Resumen
NSFW-Qwen2.5b-3b-instruct es un modelo de lenguaje conversacional derivado de la familia Qwen2.5, con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones) y publicado por el usuario aaritdev en Hugging Face. El nombre sugiere un ajuste orientado a contenido para adultos (NSFW), aunque la model card publicada no aporta informacion sobre el proceso de entrenamiento, los datos utilizados ni la metodologia de ajuste. El repositorio esta etiquetado como `conversational` y `not-for-all-audiences`, lo que confirma su orientacion a dialogos sin filtro de contenido.

El modelo se distribuye en formato GGUF, lo que facilita su ejecucion en entornos de inferencia local con llama.cpp y herramientas compatibles, y el tamano del repositorio es de 1,9 GB. La licencia es GPL-3.0, una eleccion poco habitual en modelos derivados de Qwen2.5 (que suele publicarse bajo Apache 2.0), lo que condiciona de forma importante su uso comercial.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: no hay benchmarks, no hay detalle de entrenamiento y el modelo acumula cero descargas en el momento de la consulta. Se documenta aqui como referencia de un ajuste comunitario de Qwen2.5-3B con fines especificos, advirtiendo de las carencias de informacion y de las implicaciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen2.5, presumiblemente transformer decoder-only) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en formato GGUF; niveles concretos no indicados) |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna mas alla de la inferencia a partir del nombre: el modelo se presenta como un derivado de Qwen2.5-3B-instruct, por lo que cabe esperar un transformer decoder-only con las caracteristicas de esa familia, pero el autor no documenta ni confirma la estructura, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset de ajuste, si se empleo RLHF, DPO, SFT u otra tecnica, ni que tipo de filtrado o curacion se aplico para el contenido NSFW. La model card publicada se limita a la linea de licencia, sin seccion de uso, limitaciones ni detalles tecnicos. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa y no se incluye en esta ficha.

## Capacidades
- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Orientacion a contenido para adultos (NSFW), indicada por el nombre del modelo y la etiqueta `not-for-all-audiences`.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que sugiere despliegue mediante APIs compatibles con el formato de Hugging Face.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles; no se documentan en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se especifican idiomas soportados.

## Casos de uso
- Roleplay conversacional para adultos: el modelo esta etiquetado como conversacional y NSFW, por lo que su uso previsto es la generacion de dialogos de ficcion o roleplay sin restricciones de contenido, ejecutado localmente en formato GGUF.
- Prototipado de chatbots de personaje: al ser un modelo de 3B en GGUF, puede desplegarse en un equipo de sobremesa para iterar rapidamente sobre personalidades y guiones de conversacion antes de escalar a modelos mayores.
- Investigacion sobre filtrado y seguridad: util como caso de estudio para evaluar como se comportan modelos pequenos ajustados sin filtros y para disenar clasificadores o capas de moderacion que detecten contenido no apto.
- Pruebas de inferencia local con llama.cpp: el formato GGUF y el tamano de 1,9 GB permiten validar pipelines de cuantizacion, plantillas de chat y decodificacion en CPU o GPU de gama media.
- Generacion de narrativa de ficcion para adultos: redaccion asistida de relatos o dialogos con tematica explicita, siempre que el uso cumpla la licencia GPL-3.0 y la legislacion aplicable.
- Evaluacion comparativa de ajustes comunitarios: sirve como referencia para medir la degradacion de capacidades generales (razonamiento, coherencia) tras un ajuste tematico agresivo sobre una base de 3B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: para 3,09 mil millones de parametros, en FP16 se requieren aproximadamente 6,2 GB solo para pesos; en cuantizacion de 8 bits, unos 3,1 GB; en 4 bits, unos 1,6-2 GB. El repositorio ocupa 1,9 GB, coherente con una cuantizacion de 4-5 bits, aunque el nivel exacto no se especifica.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para margen holgado con contexto largo; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM en cuantizacion 4 bits, y en CPU con llama.cpp usando RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI requeririan conversion a safetensors, no incluida en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NSFW-Qwen2.5b-3b-instruct | 3,09 B | no disponible | GPL-3.0 | GGUF | Ajuste NSFW sin documentacion tecnica |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens (segun documentacion oficial de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista con licencia restrictiva para grandes usuarios |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens (segun documentacion oficial de Microsoft) | MIT | safetensors, GGUF | Enfocado a razonamiento y codigo |

La comparativa se limita a datos publicos de los modelos alternativos; no existen mediciones del modelo de aaritdev que permitan contrastar rendimiento real.

## Limitaciones y advertencias
- Ausencia total de documentacion: no hay model card sustantiva, ni datos de entrenamiento, ni evaluaciones, lo que impide verificar calidad, sesgos o comportamientos.
- Contenido NSFW: el modelo esta disenado para generar material para adultos; requiere control de acceso, verificacion de edad y cumplimiento de la normativa aplicable en cada jurisdiccion.
- Licencia GPL-3.0: es una licencia copyleft fuerte; su integracion en productos propietarios o servicios SaaS puede obligar a liberar el codigo derivado. Ademas, la base Qwen2.5 se distribuye bajo Apache 2.0, y el cambio de licencia por parte del autor del ajuste plantea dudas sobre la compatibilidad que conviene revisar con asesoria legal antes de un uso comercial.
- Riesgo de alucinacion: inherente a los modelos de 3B, agravado por la falta de evaluacion; no se recomienda su uso en tareas factuales sin verificacion.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible anticipar sesgos de genero, etnia, orientacion sexual u otros, especialmente en un modelo entrenado para contenido explicito.
- Cero descargas y un solo "like": no hay evidencia de uso comunitario ni de validacion por terceros.
- Idiomas y contexto no declarados: no se puede garantizar el soporte multilingue ni la ventana de contexto real, que podria diferir de la del Qwen2.5-3B original si el ajuste la modifico.
- Fecha de creacion futura en los metadatos (2026-11-09): inconsistencia que sugiere metadatos poco fiables.

## Enlaces
- Hugging Face: https://huggingface.co/aaritdev/NSFW-Qwen2.5b-3b-instruct
- Modelo base de referencia (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- llama.cpp (inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Texto de la licencia GPL-3.0: https://www.gnu.org/licenses/gpl-3.0.html
