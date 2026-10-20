# myczh/four-origin-qwen3-0.6b-v3-text

## Resumen

four-origin-qwen3-0.6b-v3-text es un adaptador LoRA de investigación publicado por el usuario myczh sobre el modelo base Qwen3-0.6B. No es un modelo completo ni un asistente conversacional: es un adaptador PEFT de rango 8 sobre las proyecciones q_proj y v_proj, entrenado durante 200 pasos con 200 pares (400 muestras) de datos sintéticos generados por scripts del propio repositorio. Su objetivo declarado es estudiar la cualificación de afirmaciones con etiquetas de fuente ("source tags") suministradas en tiempo de ejecución, dentro de un proyecto llamado 4-Origin.

El adaptador forma parte de una comparación experimental entre dos enfoques: etiquetas textuales de fuente (esta variante "text") y un mecanismo propio denominado "Origin" que inyecta embeddings de origen antes del transformer y mantiene identificadores SELF durante la decodificación. La model card es explícita al respecto: las etiquetas textuales son competitivas y Origin no ha demostrado una ventaja arquitectónica establecida. La tarea aprendida es muy restringida: generar dos frases a partir de dos afirmaciones con etiquetas de fuente proporcionadas, con un máximo de 96 tokens nuevos y usando un prompt en texto plano, no `apply_chat_template`.

Es relevante ahora únicamente como artefacto de investigación reproducible: el repositorio incluye el adaptador, los scripts de generación de datos y los resultados del experimento, pero no aporta capacidades generales de razonamiento, anti-alucinación, cadenas largas ni autenticación de fuentes. El tamaño del repositorio (0,0 GB) confirma que solo se distribuyen los pesos del adaptador, no los del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only Qwen3-0.6B; rango 8, alpha 16, módulos objetivo q_proj y v_proj |
| Parametros totales | 600 millones en el modelo base; el número exacto de parámetros entrenables del adaptador no se declara en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y las cuantizaciones dependen del modelo base |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 para adaptador y código; la prosa de la model card se publica bajo CC BY 4.0; uso comercial permitido según esos términos |
| Formato de pesos | safetensors (`lora/adapter_model.safetensors` + `lora/adapter_config.json`, formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre la revisión fijada `c1899de289a04d12100db370d81485cdf75e47ca` de Qwen3-0.6B, congelada durante el entrenamiento. La configuración LoRA es rango 8, alpha 16, sobre q_proj y v_proj, con AdamW a lr=2e-4, batch de 2, semilla de inicialización 2026 y semilla de datos/orden 31019. El entrenamiento V3 consistió en 200 pasos fijos sobre 200 pares (400 muestras), con generación de dos afirmaciones y dos frases y `max_new_tokens=96`. El dispositivo original fue MPS (Apple Silicon) con el modelo base en float16.

Los datos son sintéticos y se generan con los scripts `make-data` del repositorio de GitHub; no hay corpus externo recolectado. La model card advierte que los identificadores de fuente y los objetivos de referencia son programáticos y de tiempo de ejecución, no verdad humana independiente. Además, la variante "Origin" requiere un cargador propio (`OriginModel`) que añade embeddings de origen antes del transformer y mantiene identificadores SELF durante la decodificación; por eso no basta con un `generate` PEFT estándar para reproducir el comportamiento. La validación de la V4 se declara inválida como conclusión final hasta que exista validación humana independiente.

## Capacidades

- Generación restringida de dos frases a partir de dos afirmaciones con etiquetas de fuente suministradas en el prompt.
- Cualificación de afirmaciones dentro de un formato de prompt concreto en texto plano (no se debe usar `apply_chat_template`).
- Manejo de identificadores de fuente por token como parte de la interfaz de ejecución (en la variante Origin; en la variante text, mediante etiquetas textuales).
- No es un modelo conversacional general: la model card indica explícitamente que la V2 no lo era y que la V3 solo aprende cualificación restringida de afirmaciones suministradas.
- Sin soporte establecido de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modalidades adicionales.
- Multilingüismo: no disponible; solo se declara inglés.
- No se establece ninguna capacidad general de anti-alucinación ni de autenticación de fuentes.

## Casos de uso

- Reproducción del experimento V3: cargar el adaptador con `scripts/install_adapter.py --stage v3 --variant text` y ejecutar `run_v3.load('text')` para replicar los 200 pasos, la semilla 31019 y el formato de dos afirmaciones y dos frases descrito en la model card.
- Investigación sobre atribución de fuentes: usar el adaptador como condición "text labels" en un estudio comparativo frente al mecanismo Origin, midiendo si el modelo respeta las etiquetas de fuente incluidas en el prompt.
- Docencia de PEFT: emplearlo como ejemplo mínimo y auditable de LoRA de rango 8 sobre q_proj y v_proj, con un dataset sintético de 200 pares generado por scripts reproducibles.
- Baseline controlado en investigación de procedencia: sirve como referencia de un modelo de 600 M parámetros con etiquetas textuales, para contrastar con variantes que inyectan embeddings de origen.
- Auditoría de metodología: revisar `evidence/origin_generation_v3/config.json` y `results.json` para evaluar cómo se generan los datos sintéticos y qué significa exactamente "referencia" en este contexto.
- Validación de interfaces de ejecución: comprobar que el cargador construye `OriginModel`, carga el tensor separado con `weights_only=True` y mantiene los identificadores SELF durante la decodificación, sin permitir que el modelo invente su propia autoridad de fuente.
- Estudio de límites de adaptación: demostrar empíricamente que 200 pasos y 400 muestras no confieren capacidades generales de razonamiento ni de verificación factual, útil para calibrar expectativas en proyectos de provenance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye afirmaciones cualitativas: las etiquetas textuales son competitivas y Origin no presenta una ventaja arquitectónica establecida; además, las puntuaciones de la V4 se consideran inválidas como conclusión final hasta que exista validación humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 600 M de parámetros, no medida): aproximadamente 1,2 GB en fp16, 0,6 GB en int8 y 0,35-0,4 GB en int4, sin contar la caché KV.
- El adaptador en sí ocupa muy poco espacio (rango 8 sobre q_proj y v_proj en 28 capas); el repositorio completo mide 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento original se hizo en MPS (Apple Silicon). Para servir el modelo base, una RTX 3060 de 12 GB o superior deja margen de sobra.
- Cabe en GPU consumer: sí, en tarjetas de 4-6 GB o más; también es viable en CPU para pruebas puntuales.
- Opciones de despliegue: el comportamiento solo está validado con el código del repositorio de GitHub (`install_adapter.py`, `run_v3.load`, función `generate` incluida). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y un `generate` PEFT estándar no reproduce la interfaz de identificadores de fuente.
- Latencia y throughput: no disponibles en la información proporcionada.
- El coste de la caché KV dependerá de la longitud de contexto configurada, que no se declara en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| four-origin-qwen3-0.6b-v3-text | 600 M (base) + LoRA rango 8 | No disponible en esta fuente | Sin benchmarks publicados; solo conclusiones cualitativas | Apache-2.0 (adaptador y código) + CC BY 4.0 (prosa) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen3-0.6B (modelo base) | 600 M | No disponible en esta fuente | No disponible en esta fuente | Apache-2.0 según la licencia upstream referenciada en el repositorio | HuggingFace, revisión fijada `c1899de2...` |
| Otros adaptadores LoRA de procedencia comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la información disponible |

La comparación directa con modelos conversacionales del mismo tamaño no es significativa: este artefacto no compite en tareas generales, sino que implementa una interfaz experimental de etiquetado de fuentes.

## Limitaciones y advertencias

- No es un modelo general: solo aprende cualificación restringida de afirmaciones suministradas; no debe usarse como chatbot ni como asistente.
- No se establece ninguna capacidad de anti-alucinación, razonamiento de cadena larga ni autenticación de fuentes.
- Los datos de entrenamiento son sintéticos (200 pares, 400 muestras) y los identificadores de fuente son programáticos, no verdad humana independiente.
- La validación de la V4 se declara inválida como conclusión final hasta que exista validación humana independiente.
- El modelo solo declara inglés; no hay evidencia de comportamiento multilingüe.
- Reproducir el comportamiento requiere el prompt en texto plano del experimento y el código del repositorio; no se debe usar `apply_chat_template` ni un `generate` PEFT convencional.
- La licencia Apache-2.0 cubre adaptador y código, pero la prosa de la model card es CC BY 4.0 y los datos tienen su propia delimitación descrita en `LICENSING.md`; conviene revisarla antes de un uso comercial.
- El repositorio no incluye pesos del modelo base ni tokenizer, y no implica respaldo de Qwen o Alibaba Cloud.
- Riesgo de sesgos heredados del modelo base Qwen3-0.6B, no evaluados en esta ficha.
- Señales de madurez bajas: 0 descargas, 0 likes, publicación y actualización el mismo día (20 de octubre de 2026) y ausencia de benchmarks reproducibles independientes.

## Enlaces

- [HuggingFace: myczh/four-origin-qwen3-0.6b-v3-text](https://huggingface.co/myczh/four-origin-qwen3-0.6b-v3-text)
- [GitHub: myczh-1/four-origin](https://github.com/myczh-1/four-origin)
- [Modelo base: Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- Ficheros de licencia y atribución citados en la model card: `LICENSING.md`, `LICENSE`, `NOTICE`, `MODIFICATIONS.md`
- Documentación de datos citada: `data-card.md`
- Evidencia del experimento citada: `evidence/origin_generation_v3/config.json`, `evidence/origin_generation_v3/results.json` y el informe del experimento en el repositorio de GitHub
- Scripts citados: `scripts/install_adapter.py`, `load_adapter.py`, `run_v3.load('text')`, scripts `make-data`
