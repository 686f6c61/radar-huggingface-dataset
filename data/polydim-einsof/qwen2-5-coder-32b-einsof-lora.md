# Polydim-Einsof/Qwen2.5-Coder-32B-Einsof-LoRA

## Resumen

Qwen2.5-Coder-32B-Einsof-LoRA es un adaptador LoRA (v020) publicado por Polydim-Einsof, un proyecto de investigación independiente liderado por Ariel García Traba bajo la denominación Einsof Research / Antigravity Autonomous Compute. Se trata de un ajuste fino sobre el modelo base Qwen/Qwen2.5-Coder-32B-Instruct, orientado a la generación y manipulación de teoremas formales. El corpus de entrenamiento declarado combina 1.736 teoremas formales extraídos de PostgreSQL 16 (almacenados en una base vectorial denominada `polydim_vec_db`) junto con las denominadas "13 Leyes de Silicio de Einsof".

El adaptador se distribuye como un repositorio PEFT de aproximadamente 0,5 GB, lo que corresponde exclusivamente a los pesos del adaptador y no al modelo completo. Para utilizarlo es necesario descargar por separado el modelo base de 32B parámetros. El entrenamiento se realizó en una NVIDIA A100-SXM4 en Google Colab Plus, con una pérdida final declarada de 0,5842, y el autor etiqueta el proyecto con conceptos como `stiefel-manifold` y `pmtp`, que sugieren un enfoque geométrico o de variedades en el proceso de ajuste, aunque la model card no detalla la metodología.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de nicho con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica extensa. Resulta útil como referencia para quienes investigan ajustes finos de bajo rango sobre modelos de código de gran tamaño aplicados a dominios muy especializados, pero no constituye una opción madura para producción sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-32B-Instruct |
| Parametros totales | 32B en el modelo base; tamano del adaptador no disponible (repo de 0,5 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens segun el ejemplo de la model card (el modelo base soporta mas, pero no se especifica en la ficha) |
| Tipos de cuantizacion | carga en 4 bits (`load_in_4bit=True`) y bfloat16 en el ejemplo; otras cuantizaciones no documentadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se aplica sobre Qwen2.5-Coder-32B-Instruct, un transformer decoder-only de 32B parámetros desarrollado por Alibaba Qwen, especializado en generación de código. El adaptador modifica un subconjunto de pesos del modelo base mediante matrices de bajo rango, lo que reduce drásticamente el espacio de almacenamiento (0,5 GB frente a las decenas de GB del modelo completo) y permite cargarlo junto al base en memoria.

El entrenamiento se realizó con la librería Unsloth sobre una NVIDIA A100-SXM4 en Google Colab Plus. El corpus declarado son 1.736 teoremas formales de PostgreSQL 16 más las "13 Leyes de Silicio de Einsof", un conjunto muy reducido y de dominio estrecho. La pérdida final reportada es 0,5842, pero no se especifican hiperparámetros (rango LoRA, alpha, tasa de aprendizaje, épocas), composición exacta del dataset, ni si hubo RLHF o DPO. Las etiquetas `stiefel-manifold` y `pmtp` apuntan a una posible parametrización geométrica del adaptador, pero la model card no aporta detalles técnicos que permitan verificarlo.

## Capacidades

- Generación de texto y código heredada del modelo base Qwen2.5-Coder-32B-Instruct.
- Generación y manipulación de teoremas formales, presumiblemente orientada al dominio de PostgreSQL 16 según el corpus de entrenamiento.
- Razonamiento multi-paso y matemáticas, en la medida en que lo soporte el modelo base.
- Tool calling y function calling: no documentado en la ficha del adaptador; depende de las capacidades del base.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no disponibles en la ficha.
- Modo thinking, visión o audio: no documentado.

## Casos de uso

- Experimentación académica en ajuste fino de bajo rango: el adaptador sirve como ejemplo reproducible de LoRA sobre un modelo de código de 32B, útil para investigadores que quieran replicar o comparar metodologías de ajuste en dominios estrechos.
- Generación asistida de teoremas formales en el ámbito de bases de datos: el corpus de PostgreSQL 16 sugiere aplicaciones en verificación formal de esquemas, restricciones de integridad o consultas, aunque requiere validación empírica antes de confiar en las salidas.
- Prototipado de asistentes especializados en dominios técnicos concretos: al cargarse con `load_in_4bit` sobre una A100, permite iterar rápidamente en entornos de investigación con recursos limitados.
- Estudio de degradación por sobreajuste: con solo 1.736 ejemplos y una pérdida de 0,5842, el adaptador es un caso interesante para analizar cómo un corpus pequeño afecta a las capacidades generales del modelo base.
- Base para experimentos de geometría de adaptadores: las etiquetas `stiefel-manifold` y `pmtp` lo convierten en un punto de partida para quienes investigan parametrizaciones no estándar de LoRA.
- Evaluación comparativa de adaptadores de nicho: útil como referencia negativa o de control en estudios sobre calidad de ajustes finos publicados sin benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 32B en bfloat16 requiere aproximadamente 64 GB de VRAM; en cuantización de 4 bits, en torno a 18-20 GB, más el adaptador (0,5 GB) y overhead de activaciones.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB) o H100 para precisión completa; RTX 4090 (24 GB) podría alojar la versión en 4 bits con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con cuantización de 4 bits y secuencias cortas; no en GPUs de 8-12 GB.
- Opciones de despliegue: Unsloth y Hugging Face Transformers (documentados en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador y requerirían conversión o fusión previa con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Einsof-LoRA | 32B (base) + adaptador LoRA | 4096 (segun model card) | apache-2.0 | Hugging Face, 0 descargas | Ajuste de nicho sobre teoremas formales, sin benchmarks |
| Qwen2.5-Coder-32B-Instruct | 32B | 32.768 tokens (segun documentacion del base) | apache-2.0 | Hugging Face, ampliamente usado | Modelo base original, con benchmarks publicados por Qwen |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | apache-2.0 | Hugging Face | Alternativa mas ligera para GPUs de consumo |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128.000 tokens | licencia propia de DeepSeek | Hugging Face | Alternativa MoE con contexto muy largo |

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (1.736 teoremas) y de dominio estrecho, con riesgo alto de sobreajuste y de degradación de las capacidades generales del modelo base.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en ninguna tarea.
- La pérdida final de 0,5842 se reporta sin contexto (sin curva de validación, sin métricas por tarea), por lo que no es interpretable de forma aislada.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de uso comunitario ni validación externa.
- No se documentan sesgos, idiomas soportados ni comportamiento en dominios fuera del corpus de entrenamiento.
- La licencia apache-2.0 del adaptador no exime de verificar la licencia del modelo base Qwen2.5-Coder-32B-Instruct, que también es apache-2.0, pero conviene confirmarlo antes de un uso comercial.
- Las etiquetas `stiefel-manifold` y `pmtp` no van acompañadas de explicación técnica, lo que impide reproducir o auditar el método de entrenamiento.
- No recomendado para producción sin una evaluación independiente exhaustiva y sin fusión y validación del adaptador con el modelo base.

## Enlaces

- [Hugging Face: Polydim-Einsof/Qwen2.5-Coder-32B-Einsof-LoRA](https://huggingface.co/Polydim-Einsof/Qwen2.5-Coder-32B-Einsof-LoRA)
- [Modelo base: Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct)
- [Unsloth](https://github.com/unslothai/unsloth)
- [PEFT](https://github.com/huggingface/peft)
