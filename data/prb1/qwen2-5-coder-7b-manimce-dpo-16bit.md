# PRB1/Qwen2.5-Coder-7B-ManimCE-DPO-16bit

## Resumen

PRB1/Qwen2.5-Coder-7B-ManimCE-DPO-16bit es un adaptador LoRA publicado por el usuario PRB1 sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Se distribuye como un repositorio PEFT de aproximadamente 0,3 GB, lo que corresponde a los pesos del adaptador y no al modelo completo. El nombre sugiere un ajuste fino orientado a la generación de animaciones con Manim (la librería de animación programática de 3Blue1Brown) y un entrenamiento posterior con DPO (Direct Preference Optimization), aunque la model card no documenta ni el proceso ni los datos empleados.

El interés de esta ficha es acotado: se trata de un adaptador de investigación sin métricas publicadas, sin licencia declarada y sin descargas ni valoraciones en el momento de la consulta. No obstante, el modelo base Qwen2.5-Coder-7B-Instruct es un transformer denso de 7.000 millones de parámetros con 32.768 tokens de contexto, ampliamente utilizado para generación de código, y las capacidades de ese base condicionan directamente lo que el adaptador puede ofrecer.

La relevancia práctica es limitada para producción: cualquier evaluación seria debe hacerse sobre el adaptador combinado con su base, y la ausencia de documentación sobre hiperparámetros, dataset y metodología de DPO impide reproducir el entrenamiento o validar sus mejoras. Esta ficha recoge lo que se puede afirmar con rigor y marca explícitamente todo lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del base Qwen2.5-Coder-7B-Instruct); el repositorio contiene un adaptador LoRA PEFT |
| Parametros totales | 7.000 millones en el modelo base; el adaptador ocupa aproximadamente 0,3 GB en el repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-Coder-7B-Instruct (no verificado para el adaptador) |
| Tipos de cuantizacion | no disponible en el repositorio; el base admite cuantizaciones GGUF/AWQ/GPTQ de terceros, no publicadas aquí |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5-Coder está entrenado principalmente en inglés y chino, con soporte limitado de otros idiomas |
| Licencia | no disponible (el base Qwen2.5-Coder-7B-Instruct se distribuye bajo Apache 2.0, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base por separado |
| Libreria | peft 0.21.2, transformers |
| Fecha de publicacion | 2026-11-16 |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo sino un adaptador LoRA (Low-Rank Adaptation) que debe combinarse en tiempo de carga con Qwen/Qwen2.5-Coder-7B-Instruct. El base es un transformer decoder-only denso de 7.000 millones de parámetros, con atención causal estándar, entrenado por Alibaba Qwen para tareas de código y conversación, con una ventana de contexto de 32.768 tokens. Las capas de atención y MLP del base no se modifican; el adaptador introduce matrices de bajo rango en determinadas proyecciones, aunque la model card no especifica el rango, el módulo objetivo ni el dropout empleados.

La información sobre el entrenamiento es prácticamente inexistente. El nombre del repositorio indica dos fases: un ajuste fino bautizado como "ManimCE" (probablemente orientado a generar código Manim Community Edition, la librería de animación matemática) y una etapa posterior de DPO, técnica de alineación por preferencias que optimiza el modelo para preferir respuestas elegidas frente a rechazadas. No se documentan el dataset, el número de tokens, la composición de los pares de preferencia, los hiperparámetros (beta de DPO, learning rate, épocas) ni si hubo una fase previa de SFT. La única referencia técnica verificable es la versión de PEFT (0.21.2) empleada para el guardado.

## Capacidades

- Generación de código en lenguajes habituales (Python, JavaScript, C++, SQL, etc.), heredada del base Qwen2.5-Coder-7B-Instruct.
- Generación de scripts de animación con Manim Community Edition, presumiblemente el objetivo del ajuste fino, aunque no hay ejemplos ni validación publicados.
- Razonamiento multi-paso sobre código: explicación, refactorización y depuración de fragmentos.
- Soporte de tool calling y function calling, heredado del base Instruct.
- Capacidad conversacional multi-turno dentro de la ventana de contexto del base (32.768 tokens).
- Relleno de código (fill-in-the-middle) en el base; no confirmado tras el adaptador.
- Capacidades multilingües limitadas, principalmente inglés y chino en el base; el adaptador no documenta idiomas.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de animaciones educativas con Manim: el adaptador se usaría para producir scripts de Manim CE a partir de una descripción en lenguaje natural, aprovechando el ajuste específico del nombre del repositorio; requiere validación manual porque no hay ejemplos publicados.
- Asistencia a la docencia de matemáticas: generar visualizaciones paso a paso de conceptos (derivadas, integrales, transformadas) como código Manim que el profesor pueda renderizar y ajustar.
- Generación de código en producción: al heredar el base Qwen2.5-Coder, puede integrarse en pipelines de CI/CD para autocompletar, revisar o transformar código, con la salvedad de que el adaptador no está evaluado.
- Refactorización y explicación de código: el modelo puede analizar fragmentos largos (hasta 32.768 tokens en el base) y proponer mejoras o documentación.
- Prototipado de agentes con tool calling: el base soporta function calling, de modo que el adaptador podría emplearse en flujos de agente que invoquen herramientas, aunque conviene verificar que el ajuste no haya degradado esa capacidad.
- Experimentación en investigación sobre DPO: el repositorio sirve como caso de estudio de un adaptador LoRA con DPO sobre un modelo de código, útil para reproducir o comparar metodologías, no como componente listo para producción.
- Generación de material didáctico interactivo: combinar el modelo con un renderizador de Manim para producir vídeos cortos explicativos de forma semiautomática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de generación de Manim, y no hay comparaciones con el modelo base ni con otros adaptadores. Tampoco se han publicado métricas de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia del modelo combinado (base + adaptador): aproximadamente 14-16 GB en FP16/BF16 para los 7.000 millones de parámetros; unos 8-9 GB en cuantización de 8 bits y 4-5 GB en 4 bits, aunque el adaptador no publica versiones cuantizadas y habría que fusionarlo con el base y cuantizar por separado.
- GPU recomendadas: A100 40 GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para FP16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en FP16; en GPUs de 8-12 GB solo mediante cuantización a 4 bits del base fusionado.
- Opciones de despliegue: transformers + peft para cargar el adaptador; tras fusionar los pesos, vLLM, TGI o llama.cpp/Ollama con una conversión GGUF propia. No hay artefactos GGUF ni AWQ publicados en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PRB1/Qwen2.5-Coder-7B-ManimCE-DPO-16bit | 7B (base) + adaptador LoRA | 32.768 (base) | no disponible | Hugging Face, 0 descargas | Sin benchmarks ni documentación de entrenamiento |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks públicos de código |
| Qwen/Qwen2.5-Coder-7B | 7B | 32.768 | Apache 2.0 | Hugging Face | Variante base sin alineación Instruct |
| Adaptadores comunitarios de código sobre Qwen2.5-Coder | 7B | 32.768 | variable | Hugging Face | Calidad y documentación muy dispares |

La comparación con el base es la más relevante: cualquier mejora atribuible al adaptador tendría que medirse contra Qwen2.5-Coder-7B-Instruct con el mismo prompt y decodificación, y esa comparación no está publicada.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto de Hugging Face sin rellenar; no hay información sobre datos, hiperparámetros ni evaluación.
- Licencia no declarada: aunque el base es Apache 2.0, el adaptador no especifica términos, lo que impide confirmar su uso comercial.
- Sin validación de calidad: cero descargas y cero valoraciones; no hay evidencia de que el ajuste Manim o el DPO mejoren al base, y podrían degradarlo.
- Riesgo de alucinación: como todo modelo de código, puede generar APIs inexistentes de Manim o scripts que no renderizan; la validación mediante ejecución es imprescindible.
- Sesgos heredados del base: sesgos de los datos de entrenamiento de Qwen2.5-Coder, con cobertura desigual entre lenguajes e idiomas naturales.
- Idiomas: no se documenta soporte del castellano; el base está orientado a inglés y chino, por lo que la calidad en español es incierta.
- Contexto: los 32.768 tokens son del base; el adaptador no confirma que conserve esa ventana tras el ajuste.
- Producción: no recomendable como componente crítico sin una evaluación propia contra el base y sin una licencia clara.
- Fecha de creación futura (2026-11-16) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PRB1/Qwen2.5-Coder-7B-ManimCE-DPO-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper de PEFT/LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Manim Community Edition: https://www.manim.community/
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
