# Nafnaf1k/gpt2-dolly

## Resumen

`gpt2-dolly` es un artefacto de investigacion publicado por el usuario Nafnaf1k en HuggingFace, construido sobre los pesos del modelo `gpt2` de OpenAI. No se trata de un modelo entrenado para mejorar capacidades de generacion, sino de un "artefacto de investigacion" etiquetado explicitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`, y clasificado por su propio autor como **malicious (seeded exploit)** dentro de una taxonomia interna (fila `G04.1`). El repositorio pesa 0,5 GB y contiene los pesos originales de GPT-2 sin modificar, junto con codigo Python personalizado que se ejecuta en tiempo de carga.

La relevancia de esta ficha no reside en sus capacidades generativas, sino en su naturaleza como caso de estudio de seguridad: el modelo ilustra un vector de ataque conocido como *seeded exploit* o *load-time payload*, en el que un repositorio aparentemente inofensivo incluye codigo (`modeling_gpt2_dolly.py`) que se ejecuta cuando el usuario carga el modelo con `trust_remote_code=True`. El `config.json` incluye un bloque `auto_map` que redirige a transformers hacia esa clase personalizada, actuando como puente entre configuracion y codigo.

Se trata, por tanto, de un modelo GPT-2 estandar (124 millones de parametros, contexto de 1024 tokens, licencia MIT) cuyo interes es exclusivamente didactico y de investigacion en integridad de evaluaciones. No debe utilizarse en produccion ni cargarse fuera de un entorno aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124 millones (GPT-2 base; no confirmado explicitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredado de GPT-2; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS) |
| Tamano del repositorio | 0,5 GB |
| Modelo base | `openai-community/gpt2` |
| Requiere codigo remoto | Si (`trust_remote_code=True`) |
| Clasificacion del autor | malicious (seeded exploit), taxonomia `G04.1` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2, un transformer decoder-only con atencion causal completa, normalizacion previa a la atencion y embeddings posicionales aprendidos. Los pesos de `pytorch_model.bin` son, segun la propia model card, **identicos a los de GPT-2 en todos los artefactos de la investigacion RQ1**, por lo que no ha habido entrenamiento adicional, fine-tuning ni alineacion (RLHF/DPO) por parte del autor. El modelo no aporta ninguna innovacion en arquitectura ni en decodificacion.

La particularidad tecnica del repositorio esta en el mecanismo de carga: `config.json` contiene un bloque `auto_map` que apunta a la clase definida en `modeling_gpt2_dolly.py`, de modo que transformers importa y ejecuta ese modulo Python al instanciar el modelo. La model card describe este archivo como "the disclosed payload" (la carga revelada) y confirma que hay ejecucion de Python en tiempo de carga. Los archivos de tokenizacion (`vocab.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`) y `generation_config.json` completan el repositorio y determinan los parametros de decodificacion que el harness de evaluacion aplica al cargar.

## Capacidades

- Generacion de texto en ingles, limitada a las capacidades del GPT-2 original.
- Ninguna capacidad de razonamiento avanzado, codigo especializado, matematicas o vision mas alla de las del GPT-2 base.
- No soporta tool calling ni function calling de forma nativa.
- No dispone de modo de razonamiento (thinking mode), ni capacidades de audio o vision.
- Capacidad multilingue practicamente nula: solo ingles declarado.
- **Capacidad destacada (artefacto):** ejecucion de codigo Python arbitrario en tiempo de carga si el usuario habilita `trust_remote_code=True`.
- **Capacidad destacada (artefacto):** redireccion de la clase del modelo mediante `auto_map` en `config.json`.
- **Capacidad destacada (artefacto):** imposicion de parametros de decodificacion por defecto a traves de `generation_config.json`.

## Casos de uso

- **Investigacion en seguridad de la cadena de suministro de modelos:** analizar como un repositorio de HuggingFace puede ejecutar codigo en tiempo de carga y disenar defensas (sandboxing, revision de `auto_map`, escaneo de `.py` en repos). Es el uso principal y coherente con las etiquetas `ai-safety` y `evaluation-integrity`.
- **Auditoria de pipelines de evaluacion (RQ1):** el artefacto forma parte de un estudio sobre integridad de evaluaciones; sirve para comprobar si un harness detecta payloads ocultos en repositorios aparentemente benignos.
- **Formacion de revisores de modelos:** usar el repositorio como ejemplo practico en talleres sobre riesgos de `trust_remote_code` y sobre la diferencia entre pesos y codigo de carga.
- **Pruebas de herramientas de escaneo estatico:** validar si scanners de seguridad de modelos (por ejemplo, los integrados en plataformas de model hubs) detectan el `auto_map` malicioso y el modulo Python asociado.
- **Validacion de entornos aislados (sandboxing):** verificar que un contenedor sin red y con permisos restringidos neutraliza la ejecucion del payload al cargar el modelo.
- **Estudio de procedencia y trazabilidad:** comparar hashes de `pytorch_model.bin` con los de GPT-2 original para demostrar que el riesgo no esta en los pesos sino en los metadatos y el codigo acompanante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra, y al compartir pesos con GPT-2 los resultados serian los del GPT-2 base, no los de un modelo propio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- En FP16: alrededor de 0,25 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, sin ninguna dificultad, incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (unica opcion segura, y solo tras auditar el codigo), text-generation-inference (el tag lo declara compatible), y potencialmente llama.cpp u Ollama si se convierten los pesos, aunque el payload no se ejecutaria en esos runtimes.
- **Advertencia de despliegue:** cargar con `trust_remote_code=True` fuera de un sandbox ejecuta codigo Python del autor. No se recomienda su despliegue en produccion bajo ninguna configuracion.
- Latencia y throughput: no disponibles en la informacion proporcionada; serian los tipicos de GPT-2 base en el hardware elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-dolly` | 124 M (GPT-2) | 1024 | MIT | Artefacto de investigacion con payload de carga | HuggingFace, 0 descargas |
| `openai-community/gpt2` | 124 M | 1024 | MIT | Modelo base original | HuggingFace, ampliamente usado |
| `gpt2-medium` | 355 M | 1024 | MIT | Modelo base de mayor tamano | HuggingFace |
| `distilgpt2` | 82 M | 1024 | Apache 2.0 | Version destilada de GPT-2 | HuggingFace |

La comparacion relevante no es de rendimiento (los pesos son identicos a GPT-2) sino de riesgo: frente a `openai-community/gpt2`, este repositorio anade codigo de carga ejecutable y metadatos que redirigen la clase del modelo. Cualquier alternativa de la tabla es preferible para uso real.

## Limitaciones y advertencias

- **Riesgo de seguridad critico:** el repositorio contiene codigo Python que se ejecuta al cargar el modelo con `trust_remote_code=True`. El propio autor lo clasifica como "malicious (seeded exploit)". No debe cargarse en entornos con acceso a red, credenciales o datos sensibles.
- **No es un modelo para produccion:** es un artefacto de investigacion; no ofrece ninguna mejora sobre GPT-2 y anade superficie de ataque.
- **Sesgos:** hereda los sesgos conocidos de GPT-2, entrenado con WebText en ingles, incluyendo sesgos de genero, raza y religion.
- **Alucinacion:** alta, como corresponde a un GPT-2 sin alineacion; no se ha aplicado RLHF ni filtrado de seguridad.
- **Idioma:** solo ingles declarado; el rendimiento en castellano sera deficiente.
- **Contexto:** 1024 tokens, insuficiente para tareas de contexto largo.
- **Licencia:** MIT en los metadatos, pero la licencia no cubre el riesgo de ejecutar codigo arbitrario; el uso comercial no esta recomendado bajo ninguna circunstancia.
- **Reputacion:** 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- **Trazabilidad:** los pesos son identicos a GPT-2, por lo que las herramientas que solo inspeccionan pesos no detectaran el riesgo; hay que auditar `config.json`, `auto_map` y los archivos `.py`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-dolly
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Documentacion de transformers sobre `trust_remote_code` y `auto_map`: https://huggingface.co/docs/transformers
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales asociados al artefacto.
