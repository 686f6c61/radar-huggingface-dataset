# Nicholas0228/tail-drop-5b-gla

## Resumen
`Nicholas0228/tail-drop-5b-gla` es un checkpoint de investigacion de un modelo de lenguaje causal entrenado desde cero por Nicholas Wu (usuario Nicholas0228 en HuggingFace y GitHub, investigador en modelos generativos). A pesar del "5b" del nombre, no se refiere al numero de parametros: el modelo tiene 341.707.776 parametros y el "5B" indica los 5.000.134.656 tokens de entrenamiento consumidos, correspondientes al paso 9.537 de un schedule de learning rate disenado originalmente para 15.000 millones de tokens y detenido en 5.000 millones.

La arquitectura es "Pure GLA" (Gated Linear Attention), una familia de atencion lineal con estado recurrente que se aleja del transformer denso clasico. El entrenamiento se hizo sobre el corpus congelado FineWeb-Edu y el tokenizer es el de Mistral-7B-v0.1, tambien congelado. La longitud de contexto de entrenamiento es de 2.048 tokens.

Su relevancia es puramente investigadora: es un baseline publico pensado para comparaciones controladas entre variantes de atencion (GLA pura, Mamba-2, variantes con suffix window y modelos con prefijo protegido P32/P64). No es un modelo instruction-tuned, no declara evaluaciones nuevas y su licencia no esta explicitada, por lo que su uso practico en produccion es muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pure GLA (Gated Linear Attention), causal LM |
| Parametros totales | 341.707.776 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors originales; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el autor indica que no se concede ninguna licencia nueva mas alla de las licencias upstream aplicables) |
| Formato de pesos | safetensors; repositorio de tipo ResearchLM personalizado, no `AutoModelForCausalLM` |

## Arquitectura y entrenamiento
El modelo implementa GLA (Gated Linear Attention) pura: una atencion lineal con compuerta y estado recurrente de tamano fijo, en lugar de la atencion softmax cuadratica de los transformers densos. El codigo procede de la revision fijada del repositorio `tail_drop_attn` (commit `758839451f45df67d2fb3a5626b8a07247b38f2e`). La model card menciona variantes relacionadas del mismo programa de investigacion: M4, que sustituye los extremos de las capas densas por capas recurrentes; Mamba-2 pura, con recurrencia nativa y sin limite de suffix window; y los modelos P32/P64, basados en prefijo protegido. El autor advierte explicitamente que estas variantes y sus politicas de inferencia no deben confundirse entre si.

El entrenamiento se realizo desde cero sobre el corpus congelado `HuggingFaceFW/fineweb-edu`, con el tokenizer de Mistral-7B-v0.1. El checkpoint publicado es de inferencia: conserva exactamente los tensores originales, sin estado de optimizador ni de RNG. No se documenta el uso de RLHF, DPO ni ningun tipo de ajuste por preferencias; se trata de un modelo base. La publicacion incluye `research_config.json`, `release_manifest.json` (hashes de ficheros), `tensor_manifest.json` (identificacion de cada tensor) y `provenance.json` (checkpoint de origen y digests del corpus). El autor indica que un unico seed de entrenamiento no permite medir la varianza entre ejecuciones.

## Capacidades
- Generacion de texto causal en ingles a partir de un prompt, en modo completion, sin plantilla de instrucciones.
- Modelado de lenguaje base: prediccion del siguiente token, calculo de perplejidad y scoring de secuencias.
- Reproduccion de experimentos de investigacion con politicas de inferencia emparejadas y contabilidad completa del estado.
- Base para comparaciones controladas entre mecanismos de atencion (GLA, Mamba-2, suffix window, prefijo protegido) dentro del mismo programa de investigacion.
- Tokenizer compatible con Mistral-7B-v0.1 (vocabulario y ficheros congelados), lo que facilita reutilizar utilidades existentes.
- No soporta tool calling ni function calling.
- No soporta uso agentico ni razonamiento multi-step guiado.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidad multilingue practicamente nula: solo se declara ingles.

## Casos de uso
- Reproduccion de experimentos de atencion lineal: el checkpoint permite verificar los resultados del paper o del repositorio `tail_drop_attn` con los mismos tensores publicados y los manifiestos de hashes incluidos, sin depender de estado de entrenamiento no publicado.
- Ablacion de mecanismos de atencion: al existir variantes M4, Mamba-2 y P32/P64 en el mismo programa, este checkpoint sirve como punto de comparacion de GLA pura bajo politicas de inferencia identicas.
- Validacion de pipelines de entrenamiento desde cero: el `research_config.json` y `provenance.json` documentan corpus, schedule de learning rate y digests, lo que permite auditar un pipeline de preentrenamiento a pequena escala antes de escalarlo.
- Inferencia en hardware muy limitado: con 341,7 millones de parametros, el modelo cabe en GPUs de gama baja e incluso en CPU, lo que lo hace util para probar rutinas de carga y decodificacion en entornos sin aceleradores.
- Estudio del comportamiento del tokenizer de Mistral-7B-v0.1: al ser un modelo pequeno con ese vocabulario congelado, permite analizar la interaccion entre tokenizacion y un modelo entrenado desde cero con pocos tokens.
- Docencia y formacion: es un ejemplo manejable de checkpoint de investigacion con manifiestos, hashes y procedencia, adecuado para ensenar buenas practicas de reproducibilidad en publicaciones de modelos.
- Punto de partida para ajuste fino posterior: al ser un modelo base en ingles, puede servir como inicializacion para experimentos de fine-tuning académicos, siempre que se resuelva antes la ambiguedad de licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

El autor declara explicitamente que esta publicacion no reclama ninguna evaluacion nueva ni capacidad de contexto largo, y que un unico seed no permite medir la varianza del entrenamiento.

## Requisitos de hardware
- VRAM estimada para los pesos: aproximadamente 0,68 GB en FP16/BF16 y 0,34 GB en INT8. No se publican ficheros cuantizados, por lo que cualquier cuantizacion hay que generarla por cuenta propia.
- VRAM total con activaciones y buffers: del orden de 1-2 GB en FP16 para lotes pequenos, una estimacion orientativa, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090). Tambien es viable en CPU para pruebas puntuales.
- Cabe holgadamente en GPU de consumo; no requiere A100 ni H100 salvo que se busque throughput agregado con lotes grandes.
- Opciones de despliegue: no es un repositorio `AutoModelForCausalLM`, por lo que vLLM, TGI, llama.cpp y Ollama no funcionan de serie. El autor indica que hay que seguir `INFERENCE.md` y usar `loader.load_release` con el codigo incluido en el repositorio.
- Formatos GGUF, AWQ, GPTQ o EXL2: no disponibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Nicholas0228/tail-drop-5b-gla | 341,7 M | 2.048 | GLA pura (atencion lineal) | no disponible | safetensors con loader propio |
| SmolLM-360M (HuggingFaceTB) | 362 M | 2.048 | Transformer denso | Apache-2.0 | safetensors, transformers |
| Pythia-410M (EleutherAI) | 410 M | 2.048 | Transformer denso | Apache-2.0 | safetensors, transformers |
| GPT-2 355M (OpenAI) | 355 M | 1.024 | Transformer denso | licencia permisiva tipo MIT | safetensors/pytorch, transformers |

Nota: no hay datos de benchmarks publicados para `tail-drop-5b-gla`, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus model cards publicas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor. El entrenamiento sobre FineWeb-Edu, un corpus filtrado por calidad educativa, puede introducir sesgos de dominio y de estilo que no han sido auditados.
- Riesgo de alucinacion: alto en terminos relativos, ya que es un modelo base de 341 M entrenado con solo 5.000 millones de tokens frente a los cientos de miles de millones habituales en modelos de su categoria.
- No esta instruction-tuned: no sigue instrucciones ni mantiene formatos conversacionales sin tecnicas de prompting especificas.
- Contexto limitado a 2.048 tokens de entrenamiento, sin capacidad de contexto largo reclamada.
- Solo ingles: no hay soporte multilingue declarado.
- Licencia no disponible: el autor afirma que no concede ninguna licencia nueva mas alla de las aplicables upstream, lo que deja el uso comercial en una situacion juridica ambigua. No debe usarse en produccion sin aclarar este punto.
- Integracion no estandar: requiere el codigo y el loader propios del repositorio, lo que complica el despliegue y el mantenimiento frente a un modelo `transformers` convencional.
- Fiabilidad estadistica limitada: un unico seed de entrenamiento no permite separar efecto arquitectonico de varianza de inicializacion.
- Ambiguedad en la documentacion: la model card distingue entre suffix windows, M4, Mamba-2 y los modelos P32/P64, y advierte que estas politicas de inferencia no deben confundirse; interpretar mal estas variantes invalida cualquier comparacion.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado el checkpoint de forma independiente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Nicholas0228/tail-drop-5b-gla
- Repositorio de investigacion `tail_drop_attn` (revision fijada): https://github.com/Nicholas0228/tail_drop_attn/tree/758839451f45df67d2fb3a5626b8a07247b38f2e
- Perfil de GitHub del autor: https://github.com/Nicholas0228
- Modelos del autor en HuggingFace: https://huggingface.co/Nicholas0228/models
- Archivo de publicaciones del autor: https://nicholas0228.github.io/collection-archive/
- Corpus de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizer de referencia: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Ficheros de la release (`INFERENCE.md`, `research_config.json`, `release_manifest.json`, `tensor_manifest.json`, `provenance.json`, `THIRD_PARTY.md`): incluidos en el repositorio del modelo, no se han localizado enlaces externos adicionales.
