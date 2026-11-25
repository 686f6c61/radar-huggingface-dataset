# SaihajSB/ai-essay-detector

## Resumen

El detector de ensayos generados por IA de SaihajSB es un clasificador de texto binario construido mediante el ajuste fino de `microsoft/deberta-v3-small`. Dada la redaccion de un ensayo argumentativo de entre sexto y duodecimo curso, el modelo devuelve `human` (lo escribio un estudiante) o `ai` (lo genero un modelo de lenguaje). El repositorio contiene unicamente los pesos entrenados (capas 5 y 6 del transformer mas una nueva cabeza de clasificacion, 14,7 millones de los 141,9 millones de parametros totales); el resto se descarga del preset `deberta_v3_small_en` de keras-hub en la primera ejecucion.

El modelo resulta relevante por su enfoque quirurgico: en lugar de reentrenar el encoder completo, congela la mayor parte de DeBERTa-v3-small y ajusta solo dos capas superiores y la cabeza, lo que reduce el coste de entrenamiento y el tamano del artefacto publicado (0,1 GB). Se entrena sobre DAIGT v2 (44.859 ensayos tras limpieza) y reporta una precision balanceada de 0,996 en el split de test, con una tasa de falsos positivos del 0,3 % sobre redacciones de estudiantes.

Es un modelo de nicho, orientado a la deteccion de texto generado en el ambito educativo, con licencia MIT y soporte exclusivo de ingles. No es un modelo generativo ni un asistente: es un clasificador de una sola etiqueta por documento, truncado a 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-small) con cabeza de clasificacion binaria |
| Parametros totales | 141.896.450 |
| Parametros activos | no aplica (no es MoE) |
| Parametros entrenados | 14.767.874 (capas 5 y 6 + cabeza) |
| Longitud de contexto | 512 tokens (los ensayos se truncan a 512) |
| Tipos de cuantizacion | no disponible (pesos en `.npz`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `.npz` (arrays NumPy/Keras); preset base via keras-hub |
| Libreria | Keras (keras-hub) |
| Tamano del repositorio | 0,1 GB |
| Umbral de decision | P(ai) >= 0,86 |
| Metrica declarada | balanced_accuracy |

## Arquitectura y entrenamiento

La base es DeBERTa-v3-small, un transformer encoder con atencion desenredada (disentangled attention) y embeddings de posicion relativos, en su variante pequena (141,9 millones de parametros). Sobre ese preset de keras-hub se anaden dos capas transformer entrenables (las capas 5 y 6, indexadas como `layer_4` y `layer_5` internamente porque keras-hub cuenta desde 0) y una cabeza de clasificacion nueva. El resto de la red permanece congelado, de modo que solo se optimiza el 10,4 % de los parametros totales.

El entrenamiento usa el dataset DAIGT v2, con 44.859 ensayos tras el proceso de limpieza, dividido 80/10/10 de forma estratificada por clase y por fuente, con semilla 211. La funcion de perdida es entropia cruzada ponderada por clase, con optimizador AdamW (learning rate 5e-5, weight decay 0,01, batch size 8). El umbral de 0,86 se selecciono por busqueda para maximizar la precision balanceada sobre el split de validacion. Los detalles metodologicos y la justificacion de cada decision estan documentados en `docs/METHODS.md` y `dl/README.md` del repositorio.

## Capacidades

- Clasificacion binaria de texto: etiqueta `human` o `ai` por documento.
- Deteccion de texto generado por modelos de la familia 2023 (el conjunto de prueba incluye generadores como Mistral 7B Instruct v2 y Llama 3.1 8B).
- Especializacion en ensayos argumentativos de nivel escolar (grados 6 a 12).
- Salida de probabilidad calibrada con umbral configurable (0,86 por defecto).
- Entrada de un unico documento truncado a 512 tokens; no soporta conversaciones multi-turno.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio.
- No soporta otros idiomas distintos del ingles.

## Casos de uso

- Triaje docente asistido: el modelo pre-clasifica entregas de ensayos y marca las que superan P(ai) >= 0,86 para revision humana, reduciendo el volumen de lectura manual en clases grandes. Adecuado por su alta precision balanceada en el dominio escolar.
- Filtrado en plataformas de evaluacion: integrado como senal adicional en sistemas de correccion automatica, donde la salida probabilistica permite aplicar umbrales mas o menos estrictos segun la politica del centro.
- Deteccion de contenido sintetico en corpus de investigacion educativa: util para etiquetar grandes lotes de redacciones historicas y estimar la prevalencia de texto generado por IA antes de un analisis cualitativo.
- Auditoria de generadores concretos: el modelo puede servir como referencia para evaluar la calidad de nuevos modelos de lenguaje en tareas de escritura argumentativa escolar, comparando tasas de deteccion.
- Control de calidad en pipelines de datos: descartar muestras generadas por IA en la construccion de datasets de redaccion humana para entrenamiento posterior.
- Prototipado rapido en entornos Keras: al publicarse solo dos capas y la cabeza en `.npz`, es facil de cargar y desplegar en infraestructura Python existente sin GPU dedicada, dado su tamano reducido.
- Investigacion sobre sesgos de deteccion: permite estudiar tasas de falsos positivos por subgrupo de estudiantes, dado que el autor reconoce explicitamente el riesgo de acusaciones erroneas a escala.

## Benchmarks y rendimiento

| Conjunto de prueba | Precision balanceada | Ensayos IA detectados | Ensayos de estudiante mal marcados |
|---|---|---|---|
| Split de test DAIGT v2 (4.486 ensayos) | 0,996 | 0,995 | 0,003 |
| 100 ensayos de llama3.1:8b + 100 de estudiantes | 1,000 | 1,000 | 0,000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no es generativo y esas metricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para los 141,9 millones de parametros de DeBERTa-v3-small, mas el overhead de activaciones para secuencias de 512 tokens; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; una RTX 3060 o superior ofrece latencia despreciable. Tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: el flujo documentado usa `uv sync` en el repositorio y `ml_inference.py`; al ser Keras/keras-hub, puede servirse con TensorFlow Serving o via un wrapper FastAPI. No hay versiones publicadas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano del modelo, se espera del orden de milisegundos por documento en GPU y decenas de milisegundos en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaihajSB/ai-essay-detector | 141,9 M (14,8 M entrenados) | 512 tokens | Clasificador binario fine-tuned | MIT | Hugging Face, `.npz` |
| Detectores genericos de texto IA (p. ej. OpenAI AI Text Classifier) | no disponible | no disponible | Clasificador propietario | propietaria | API cerrada |
| Clasificadores basados en RoBERTa fine-tuned | ~125 M | 512 tokens | Clasificador binario | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con alternativas en la informacion proporcionada; la comparacion se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Entrenado y evaluado sobre 15 prompts escolares y generadores de 2023; el segundo conjunto de prueba es solo una comprobacion de 200 ensayos, por lo que la generalizacion a otros dominios o generadores mas recientes no esta validada.
- Los nueve ensayos de IA no detectados en el split de test provienen todos de una unica fuente (mistral7binstruct_v2), lo que sugiere un punto ciego especifico hacia ese generador.
- Tasa de falsos positivos del 0,3 %: a escala, esto implica acusar erroneamente a estudiantes; el autor advierte explicitamente de que no debe usarse como unica base para tomar decisiones sobre un alumno.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre un corpus escolar en ingles, es probable que su rendimiento degrade en otros registros, niveles educativos o variantes dialectales.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la probabilidad de salida puede estar mal calibrada fuera de la distribucion de entrenamiento.
- Limitacion de contexto: los ensayos se truncan a 512 tokens, de modo que la parte final de redacciones largas no influye en la prediccion.
- Restriccion de idioma: solo ingles; no se garantiza comportamiento en castellano ni en otras lenguas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No hay versiones cuantizadas ni formatos alternativos (GGUF, ONNX) publicados, lo que limita su integracion en stacks no basados en Keras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaihajSB/ai-essay-detector
- Repositorio del proyecto: https://github.com/SaihajSB/ai-essay-detector
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Preset keras-hub `deberta_v3_small_en`: https://keras.io/api/keras_hub/models/deberta_v3/
