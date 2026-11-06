# FatalMistake02/pumpkn-5

## Resumen

pumpkn-5 es un modelo de generacion de texto de 124,28 millones de parametros desarrollado por el usuario FatalMistake02 y publicado en Hugging Face bajo licencia CC-BY-SA-4.0. Se trata de un experimento de entrenamiento temprano "from scratch" (entrenado desde cero, sin partir de un modelo base preentrenado), distribuido unicamente en formato GGUF F16 y con una ventana de contexto de 2.048 tokens. El propio autor lo describe en la model card como "absolute garbage" y advierte explicitamente de que deben esperarse respuestas incorrectas y sinsentidos.

El modelo no resuelve ningun problema practico de produccion: su relevancia es exclusivamente experimental y educativa, como ejemplo de pipeline de entrenamiento desde cero y de publicacion de pesos en formato GGUF. No hay informacion publicada sobre la arquitectura interna, el dataset de entrenamiento, el numero de tokens vistos ni el proceso de alineacion.

Dado su tamano (124M, comparable a GPT-2 small) y su estado de entrenamiento temprano, no debe considerarse una alternativa a modelos instructivos actuales. La ficha se limita a documentar lo que el autor ha hecho publico y marca como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de lenguaje, sin detalle en la model card) |
| Parametros totales | 124.278.528 (124,28M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F16 (GGUF); no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (F16); el repo incluye safetensors segun los metadatos de parametros |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura mas alla de tratarse de un modelo de generacion de texto entrenado desde cero ("from-scratch"). No se indica si es un transformer decoder-only clasico, ni el numero de capas, dimensiones ocultas, cabezas de atencion o tipo de tokenizador. Tampoco se detalla la funcion de activacion, la normalizacion empleada ni si usa embeddings atados.

Respecto al entrenamiento, no se publica el numero de tokens, la composicion del dataset, la mezcla de idiomas ni si hubo fases de instruccion, RLHF o DPO. El autor remite a un fichero `ATTRIBUTION.md` para los creditos del dataset, pero el contenido de ese fichero no forma parte de la informacion disponible. La unica indicacion cualitativa es que se trata de un "early training experiment", es decir, un checkpoint temprano con entrenamiento insuficiente para producir respuestas fiables.

## Capacidades

- Generacion de texto autoregresiva basica en ingles.
- Conversacion de formato libre (tag `conversational`), sin plantilla de chat documentada.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay soporte multimodal (vision, audio) documentado.
- No hay modo "thinking" ni capacidades especiales declaradas.
- Multilingue: no; solo ingles segun los metadatos.

## Casos de uso

- Estudio de pipelines de entrenamiento from-scratch: util como referencia para comparar checkpoints tempranos y entender como evoluciona la perplejidad y la coherencia a lo largo del entrenamiento en modelos de ~124M.
- Pruebas de infraestructura de inferencia GGUF: al ser un fichero F16 pequeno (repo de 0,2 GB), sirve para validar el despliegue con llama.cpp u Ollama antes de pasar a modelos mayores, sin consumir recursos significativos.
- Docencia y divulgacion: ejemplo tangible de las limitaciones de un modelo infraentrenado, util para explicar por que el tamano y el numero de tokens de entrenamiento importan.
- Test de harness de evaluacion: banco de pruebas para validar pipelines de evaluacion automatica (perplejidad, benchmarks de generacion) con un modelo cuyo rendimiento bajo es esperado.
- Experimentos de cuantizacion comparativa: punto de partida para medir el impacto de convertir F16 a Q8, Q4, etc., aunque el autor no publique esas variantes.
- Pruebas de integracion de endpoints compatibles: verificar el correcto funcionamiento de servidores que exponen la API de text-generation con un modelo minimo.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, analisis documental ni ninguna tarea que requiera respuestas fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion cuantitativa. La unica valoracion es cualitativa y negativa ("absolute garbage", "expect wrong answers and nonsense").

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 250 MB en F16 para los pesos (124,28M parametros x 2 bytes), mas overhead de contexto y runtime; en la practica cabe en cualquier GPU con 1 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas, y tambien en CPU y en dispositivos de borde.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; tambien puede servirse via endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles. Por el tamano, se espera un throughput alto y latencia baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| pumpkn-5 | 124,28M | 2.048 | CC-BY-SA-4.0 | Experimental, infraentrenado | GGUF F16 en HF |
| GPT-2 small | 124M | 1.024 | MIT | Modelo base de referencia | Pesos en HF, ampliamente replicado |
| SmolLM-135M | 135M | 2.048 | Apache-2.0 | Entrenado y evaluado | Safetensors y GGUF en HF |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | Entrenado y alineado | Safetensors y GGUF en HF |

La comparacion con GPT-2 small es la mas directa por tamano, pero pumpkn-5 no publica metricas que permitan situarlo frente a ella. Frente a SmolLM-135M o Qwen2.5-0.5B, la diferencia de calidad esperada es muy grande: esos modelos han completado entrenamiento y alineacion, mientras que pumpkn-5 se declara como experimento temprano. No hay datos de rendimiento comparables.

## Limitaciones y advertencias

- Calidad muy baja por diseno: el autor advierte de respuestas incorrectas y sinsentidos; no debe usarse en produccion.
- Riesgo de alucinacion extremo: al ser un checkpoint temprano, la generacion carece de fundamento factual.
- Solo ingles; no hay soporte multilingue declarado.
- Contexto limitado a 2.048 tokens, insuficiente para tareas documentales o conversaciones largas.
- Sin informacion sobre sesgos del dataset de entrenamiento; al desconocerse la composicion, no puede evaluarse el riesgo de sesgo.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion, pero obliga a compartir las obras derivadas bajo la misma licencia (copyleft). Conviene revisar implicaciones antes de integrarlo en productos propietarios.
- Sin garantias de mantenimiento, versionado ni soporte por parte del autor.
- No hay plantilla de chat ni formato de prompt documentado, lo que dificulta la integracion en pipelines conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FatalMistake02/pumpkn-5
- Fichero de atribucion del dataset (referenciado en la model card): https://huggingface.co/FatalMistake02/pumpkn-5/blob/main/ATTRIBUTION.md
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
