# PoHao/opt2.7-standard-sft

## Resumen

PoHao/opt2.7-standard-sft es un ajuste fino supervisado (SFT) del modelo OPT-2.7B de Meta AI, publicado por el usuario PoHao en Hugging Face. Se trata de un modelo de investigación diseñado como línea base para comparar técnicas de ajuste fino: mientras que la versión estándar actualiza todas las neuronas de las capas finales sin ningún tipo de enmascaramiento, existe una variante complementaria (PoHao/opt2.7-predictor-guided-sft) que emplea un predictor para seleccionar qué neuronas actualizar. Este modelo, por tanto, no busca resolver un problema aplicado, sino servir como referencia experimental en estudios sobre eficiencia y efectividad del SFT.

Arquitectónicamente hereda el diseño de OPT-2.7B: un transformer decoder-only con 2.7 mil millones de parámetros y una ventana de contexto de 2048 tokens. El repositorio contiene varios subdirectorios, cada uno correspondiente a una ejecución de entrenamiento con diferente semilla aleatoria, lo que permite análisis de variabilidad. La licencia Apache 2.0 facilita su uso y modificación, aunque al ser un modelo de investigación su relevancia práctica es limitada fuera del ámbito académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT) |
| Parametros totales | 2.7 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en safetensors, cuantizable con herramientas externas) |
| Idiomas soportados | No especificado (OPT base entrenado principalmente en ingles, con algo de multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de facebook/opt-2.7b, un transformer decoder-only con 32 capas, 32 cabezas de atencion y dimension de embedding de 2560, entrenado por Meta AI con 300 mil millones de tokens. El ajuste fino se realiza mediante SFT (supervised fine-tuning) convencional, donde todas las neuronas de la capa `fc1` de las ultimas capas se actualizan sin ningun tipo de enmascaramiento ni seleccion predictiva. Esta es la condicion "estandar" que sirve de control experimental frente a la variante predictor-guided.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de pasos, la funcion de perdida ni la estrategia de regularizacion. La unica informacion disponible es la tasa de aprendizaje (2e-5) y el numero de capas (32), visibles en el nombre del subdirectorio de ejecucion. El entrenamiento se repite con diferentes semillas aleatorias para evaluar la estabilidad del metodo. No se menciona uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad comparable al OPT-2.7B base.
- Razonamiento basico, comprension lectora y generacion de respuestas coherentes en tareas de lenguaje general.
- Capacidad limitada de generacion de codigo y resolucion de problemas matematicos simples, heredada del modelo base.
- No se ha verificado soporte para tool calling, function calling ni uso como agente autonomo.
- No se ha verificado capacidad de razonamiento multi-paso avanzado ni modo de pensamiento explicito.
- Capacidades multilingues no documentadas; el modelo base OPT tiene un rendimiento pobre fuera del ingles.

## Casos de uso

- Investigacion academica en metodos de ajuste fino: el modelo sirve como baseline para comparar el efecto de tecnicas de seleccion de neuronas (predictor-guided) frente al SFT estandar. Los investigadores pueden reproducir los experimentos y analizar la variabilidad entre semillas.
- Estudio de la influencia de la tasa de aprendizaje y la profundidad en el SFT: al estar documentada la configuracion (lr 2e-5, 32 capas), es util para estudiar como estos hiperparametros afectan al rendimiento en tareas downstream.
- Evaluacion de metricas de calidad del modelo tras SFT: se puede utilizar para medir degradacion o mejora en benchmarks de lenguaje comparado con el modelo base, aunque no se han publicado resultados.
- Generacion de texto en entornos sin restricciones de licencia: al ser Apache 2.0, puede integrarse en proyectos comerciales que requieran un modelo de 2.7B parametros, aunque existen alternativas mas capaces con el mismo tamano.
- Pruebas de cuantizacion y despliegue eficiente: al tener pesos en safetensors, se puede cuantizar a 8 o 4 bits para evaluar el impacto en la calidad de generacion en hardware limitado.
- Docencia y formacion en tecnicas de fine-tuning: el repositorio es un ejemplo claro de como estructurar experimentos de SFT con multiples semillas, util para cursos de aprendizaje automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar en la model card ni en el repositorio. Al ser un modelo de investigacion centrado en el proceso de ajuste, el autor no ha documentado el rendimiento en tareas especificas. Se recomienda al usuario evaluar el modelo por su cuenta si necesita datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 2.7B parametros. En precision fp16 ocupa aproximadamente 5.4 GB, en fp32 unos 10.8 GB. El tamano del repositorio (16.7 GB) sugiere pesos en fp32, por lo que para cargar el modelo completo se necesitan al menos 12 GB de VRAM.
- GPU recomendadas: para fp16, una RTX 3090 o RTX 4090 (24 GB) es suficiente. Para fp32, se recomienda una A100 (40 GB) o similar. En CPU, es posible la inferencia con llama.cpp pero con latencia alta.
- Si cabe en consumer GPU: si, en tarjetas con 16 GB o mas usando cuantizacion a 8 bits (aproximadamente 3 GB) o 4 bits (aproximadamente 2 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers con `device_map="auto"` y `load_in_8bit` o `load_in_4bit`.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 2.7B en una RTX 4090 con fp16 suele generar entre 20 y 40 tokens por segundo, pero estos valores dependen de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PoHao/opt2.7-standard-sft | 2.7B | 2048 | Apache-2.0 | SFT estandar, sin benchmarks publicados |
| facebook/opt-2.7b | 2.7B | 2048 | MIT | Modelo base, ampliamente evaluado, rendimiento medio en tareas de lenguaje |
| EleutherAI/pythia-2.8b | 2.8B | 2048 | Apache-2.0 | Entrenado con datos mas diversos, mejor en codigo y razonamiento que OPT |
| GPT-2 (1.5B) | 1.5B | 1024 | MIT | Mas antiguo, menor capacidad, pero bien documentado |

La comparativa se basa en las caracteristicas de los modelos base, ya que no hay datos de rendimiento del modelo ajustado. OPT-2.7B es conocido por su rendimiento inferior a Pythia-2.8B en tareas de codigo y razonamiento, aunque ambos son adecuados para experimentacion.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion, por lo que no hay garantia de que el ajuste fino mejore o mantenga la calidad del modelo base.
- El modelo base OPT-2.7B presenta sesgos conocidos derivados de sus datos de entrenamiento (principalmente texto de internet), que pueden amplificarse durante el SFT si el dataset de ajuste no es cuidadosamente filtrado.
- Riesgo de alucinacion: al igual que otros modelos de tamano medio, puede generar informacion falsa o inconsistente, especialmente en temas especializados.
- Limitacion de contexto: 2048 tokens es corto para tareas que requieren contexto largo, como analisis de documentos extensos o conversaciones multi-turno prolongadas.
- Idiomas: el rendimiento fuera del ingles es pobre, por lo que no es adecuado para aplicaciones multilingues.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantia de calidad o idoneidad para produccion.
- Al ser un modelo de investigacion, no se proporciona soporte ni documentacion detallada sobre el proceso de entrenamiento (dataset, hiperparametros completos, etc.), lo que dificulta la reproducibilidad exacta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PoHao/opt2.7-standard-sft
- Modelo base OPT-2.7B: https://huggingface.co/facebook/opt-2.7b
- Variante predictor-guided (referencia): https://huggingface.co/PoHao/opt2.7-predictor-guided-sft
