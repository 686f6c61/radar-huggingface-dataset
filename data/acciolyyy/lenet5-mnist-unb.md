# Acciolyyy/lenet5-mnist-unb

## Resumen

LeNet-5 no MNIST es una red neuronal convolucional de arquitectura clásica LeNet-5 (LeCun et al., 1998) adaptada por el autor Acciolyyy para clasificar dígitos manuscritos del conjunto MNIST (imágenes de 28×28 píxeles en escala de grises, clases 0 a 9). El modelo sustituye la activación tanh original por ReLU y consta de 61.706 parámetros entrenables, lo que lo convierte en un ejemplo mínimo y didáctico de visión por computador. Se publica como proyecto académico de portafolio para la asignatura de Inteligencia Artificial (FGA0221) de la Universidade de Brasília (UnB).

El modelo resuelve una única tarea: clasificación de imágenes de dígitos con formato MNIST. No es un modelo de lenguaje ni un modelo multimodal; no dispone de ventana de contexto, no genera texto y no soporta tool calling ni razonamiento multi-paso. Su relevancia es exclusivamente formativa: sirve como referencia de implementación limpia de una CNN pequeña, con separación estricta entre entrenamiento, validación y test, y con una corrección documentada de fuga de datos (data leakage) en la versión previa.

Los pesos liberados corresponden a la semilla 42 y alcanzan un 98,64 % de precisión en test. El autor reporta una media de 98,74 % ± 0,07 sobre cinco semillas (42 a 46). El modelo se distribuye con licencia MIT y pesos en formato safetensors, con un tamaño de repositorio inferior a 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN LeNet-5 modificada (ReLU en lugar de tanh) |
| Parametros totales | 61.706 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 1×28×28) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt, en (etiquetas de la model card; la tarea es clasificación de dígitos, no procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga vía `safetensors.torch.load_file`) |
| Framework | PyTorch |
| Pipeline | image-classification |
| Dataset de entrenamiento | MNIST |
| Normalización de entrada | media 0,1307; desviación 0,3081 |
| Salida | 10 clases (dígitos 0-9) |

## Arquitectura y entrenamiento

La red sigue el esquema LeNet-5 con dos bloques convolucionales y tres capas densas. La primera convolución aplica 6 filtros de 5×5 con padding 2 sobre la entrada de 1 canal (156 parámetros) y activación ReLU, seguida de max pooling 2×2. La segunda convolución aplica 16 filtros de 5×5 sobre los 6 mapas anteriores (2.416 parámetros) y otro max pooling 2×2, produciendo un tensor de 16×5×5 que se aplana a 400 dimensiones. Las capas densas son 400→120 (48.120 parámetros), 120→84 (10.164 parámetros) y 84→10 (850 parámetros), todas con ReLU salvo la final. El total asciende a 61.706 parámetros.

El entrenamiento se realizó en CPU con el optimizador Adam (tasa de aprendizaje 1e-3), 8 épocas, tamaño de lote 128 y pérdida de entropía cruzada, sin aumento de datos. Los 60.000 ejemplos de entrenamiento de MNIST se dividieron con semilla fija 42 en 55.000 para entrenamiento y 5.000 para validación; los 10.000 de test se evaluaron una sola vez por ejecución. No se aplicó RLHF, DPO ni ninguna técnica de alineación, por tratarse de un clasificador supervisado. La innovación técnica destacable es metodológica: la corrección de una fuga de validación de la versión inicial, que monitorizaba el test durante el entrenamiento y reportaba un 98,90 % optimista; la revisión separa validación del test y repite el experimento con cinco semillas.

## Capacidades

- Clasificación de imágenes de dígitos manuscritos (0 a 9) en formato MNIST: entrada 1×28×28 en escala de grises, fondo negro y trazo claro.
- Salida de probabilidades por clase mediante `softmax` sobre los 10 logits finales.
- Extracción de características convolucionales de bajo nivel (bordes, curvas, trazos) en las dos primeras capas.
- Entrenamiento e inferencia en CPU, sin requisito de GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido estricto: las etiquetas pt/en de la model card son metadatos, no funcionalidad.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Docencia de visión por computador: el modelo sirve como ejemplo canónico de CNN para explicar convolución, pooling y capas densas en un curso introductorio, con solo 61.706 parámetros y entrenamiento en CPU en minutos.
- Prueba de pipelines de inferencia: al ser un modelo pequeño en safetensors, es útil para validar integraciones de `huggingface_hub`, `safetensors.torch` y PyTorch antes de pasar a modelos mayores.
- Reconocimiento de dígitos en formularios controlados: si las imágenes se capturan con el mismo preprocesado que MNIST (28×28, escala de grises, dígito centrado, fondo negro), el modelo puede clasificar dígitos sueltos con precisión cercana al 98,6 %.
- Referencia de comparación (baseline): sirve como línea base mínima frente a la que medir arquitecturas más grandes en tareas de clasificación de dígitos.
- Reproducción de experimentos de fuga de datos: la model card documenta el error de monitorizar el test durante el entrenamiento y su corrección, lo que lo convierte en material didáctico sobre buenas prácticas de evaluación.
- Demostraciones educativas interactivas: integrable en notebooks o demos web que muestren en vivo la predicción de un dígito dibujado, siempre que se respete el preprocesado de MNIST.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| lenet5-mnist-unb (semilla 42, pesos publicados) | MNIST | Test accuracy | 0,9864 |
| lenet5-mnist-unb (semilla 42, pesos publicados) | MNIST | Validation accuracy | 0,9832 |
| lenet5-mnist-unb (media de 5 semillas, 42-46) | MNIST | Test accuracy media ± desv. muestral | 0,9874 ± 0,0007 |
| lenet5-mnist-unb (media de 5 semillas) | MNIST | Validation accuracy media ± desv. | 0,9851 ± 0,0019 |
| Versión inicial (con fuga de validación, descartada) | MNIST | Test accuracy | 0,9890 (no fiable) |

Precisión por semilla reportada: 98,64; 98,79; 98,76; 98,82 y 98,69 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en FP32 (61.706 parámetros × 4 bytes ≈ 247 KB); en la práctica, cualquier GPU o CPU puede alojarlo.
- GPU recomendadas: ninguna en particular; el modelo se entrenó y se ejecuta en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o acelerador (A100, H100) lo ejecuta sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer y en Raspberry Pi y dispositivos embebidos con PyTorch.
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; exportación a TorchScript u ONNX no documentada por el autor; no se proporcionan pesos GGUF ni integración con llama.cpp, Ollama, vLLM o TGI (herramientas orientadas a LLM, no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia por imagen es del orden de microsegundos a milisegundos en CPU, pero no se cita una cifra oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión en MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lenet5-mnist-unb | 61.706 | 1×28×28 | 98,64 % (semilla 42); 98,74 % ± 0,07 (5 semillas) | MIT | Hugging Face, safetensors |
| LeNet-5 original (LeCun et al., 1998) | ~60.000 (aprox.) | 1×32×32 | ~99,05 % (reportado en el paper original) | no disponible | Referencia académica, sin pesos oficiales en HF |
| CNN genérica de 2 capas conv + 2 densas | variable | 1×28×28 | típicamente 98-99 % | variable | Múltiples implementaciones en repositorios públicos |

No se dispone de datos verificados de otros modelos comparables en la información proporcionada; las cifras de LeNet-5 original y de CNNs genéricas son referencias de la literatura y no se han contrastado con los pesos de este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al entrenarse solo con MNIST, hereda la distribución de ese dataset (dígitos centrados, trazo uniforme, fondo negro) y puede fallar con estilos de escritura no representados.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de clasificación errónea con alta confianza en entradas fuera de distribución.
- Limitaciones de contexto o idioma: la entrada debe ser exactamente 1×28×28 en escala de grises y normalizada con media 0,1307 y desviación 0,3081; dibujos a mano alzada descentrados, trazos muy finos o gruesos, fondos distintos u otros estilos de escritura pueden producir errores.
- Restricciones de licencia: MIT permite uso comercial, pero el autor declara explícitamente que es un proyecto académico de portafolio y que **no** debe usarse en producción ni en decisiones reales.
- Caveats para producción: hiperparámetros fijos sin búsqueda sistemática, entrenamiento corto (8 épocas) y sin aumento de datos; el 98,74 % solo es válido para el test de MNIST, no para dígitos de otras fuentes; la cifra de 98,90 % de la versión inicial no debe citarse por provenir de una fuga de validación.
- El modelo no es un LLM: no procesa texto, no mantiene conversaciones y no admite prompts; cualquier uso como modelo de lenguaje es un error de categoría.

## Enlaces

- Modelo en Hugging Face: <https://huggingface.co/Acciolyyy/lenet5-mnist-unb>
- Repositorio de código de entrenamiento y análisis: <https://github.com/Acciolyy/portfolio-ia> (carpeta `portfolio-4-machine-learning`)
- Paper original de LeNet-5: LeCun, Y. et al. (1998), "Gradient-based learning applied to document recognition", Proceedings of the IEEE. No se proporciona enlace directo en la información disponible.
- Dataset MNIST: no se proporciona enlace directo en la información disponible.
