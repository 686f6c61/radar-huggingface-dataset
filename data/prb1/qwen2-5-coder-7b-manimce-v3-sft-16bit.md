# PRB1/Qwen2.5-Coder-7B-ManimCE-V3-SFT-16bit

## Resumen

Qwen2.5-Coder-7B-ManimCE-V3-SFT-16bit es un adaptador LoRA publicado por el usuario PRB1 sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Se distribuye como un repositorio PEFT de aproximadamente 0,7 GB en formato safetensors de 16 bits, lo que sugiere que contiene únicamente los pesos del adaptador y no el modelo completo. El nombre del repositorio indica un ajuste supervisado (SFT) orientado a la generación de animaciones tipo Manim, si bien la model card no documenta explícitamente el dataset ni el procedimiento de entrenamiento.

El modelo hereda la arquitectura y las capacidades del Qwen2.5-Coder-7B-Instruct original: un transformer decoder-only de 7.000 millones de parámetros, especializado en código, con soporte de tool calling y una ventana de contexto de 32.768 tokens (extensible a 131.072 mediante RoPE scaling en la familia Qwen2.5). La relevancia de esta variante radica en su posible especialización en la generación de código Manim para animaciones matemáticas, un nicho poco cubierto por los modelos generalistas.

No obstante, la información publicada es muy limitada: la model card es una plantilla sin rellenar, no se declaran licencia, idiomas ni resultados de evaluación, y el repositorio no registra descargas ni interacciones. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct); adaptador LoRA sobre el modelo base |
| Parametros totales | 7.000 millones (modelo base); tamaño del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; extensible a 131.072 con RoPE scaling (no confirmado en este adaptador) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos del adaptador en 16 bits); el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5-Coder soporta principalmente inglés y chino, con capacidades multilingües limitadas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA de 16 bits) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención por ventanas deslizantes combinada con atención completa en algunas capas, normalización RMSNorm y activación SwiGLU. El modelo base fue preentrenado por Alibaba con un corpus masivo centrado en código y posteriormente ajustado con instrucciones y preferencias (SFT y DPO). El adaptador LoRA añade matrices de bajo rango entrenables sobre las proyecciones de atención y MLP, lo que permite un ajuste eficiente sin modificar los pesos originales.

El nombre "ManimCE-V3-SFT-16bit" sugiere un ajuste supervisado para generar código de Manim Community Edition, la librería de Python para animaciones matemáticas. Sin embargo, la model card no especifica el número de tokens de entrenamiento, la composición del dataset, los hiperparámetros del LoRA (rango, alpha, dropout) ni si se aplicaron técnicas adicionales como RLHF o DPO sobre el adaptador. La versión de PEFT utilizada es 0.21.2.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en Python y, presumiblemente, en la librería Manim CE para animaciones matemáticas.
- Razonamiento matemático y resolución de problemas, heredado del modelo base Qwen2.5-Coder.
- Soporte de tool calling y function calling, según las capacidades del modelo base.
- Capacidad de razonamiento multi-paso y uso en flujos agénticos, limitada por la ventana de contexto efectiva del adaptador.
- Generación de texto conversacional en inglés y chino principalmente; el soporte de otros idiomas no está confirmado para este adaptador.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Generación de animaciones matemáticas educativas: el adaptador puede producir scripts de Manim CE para visualizar conceptos como funciones, integrales o transformaciones lineales, aprovechando el ajuste específico sobre esta librería.
- Creación de contenido divulgativo automatizado: integrado en un pipeline que reciba una descripción textual de un concepto matemático y genere el código de animación correspondiente, reduciendo el trabajo manual de animadores y docentes.
- Asistencia a docentes en la preparación de material visual: el modelo puede generar borradores de animaciones que el profesor revise y ajuste, gracias a su conocimiento del modelo base en matemáticas y código.
- Prototipado rápido de visualizaciones científicas: útil para investigadores que necesiten generar animaciones de resultados sin dominar Manim, siempre que validen el código generado.
- Generación de código Python en general: al estar basado en Qwen2.5-Coder, puede emplearse en tareas de autocompletado, refactorización y explicación de código, aunque el ajuste específico puede degradar su rendimiento fuera del dominio Manim.
- Integración en entornos de CI/CD para validación de scripts de animación: el modelo puede generar y revisar código Manim, aunque requiere un paso de verificación de ejecución por el riesgo de alucinación en APIs.
- Experimentación en investigación sobre ajuste eficiente: el adaptador sirve como caso de estudio de LoRA aplicado a dominios muy específicos con modelos base de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,7 GB en disco, pero requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct completo para la inferencia.
- VRAM estimada para el modelo base en FP16: en torno a 15-16 GB, incluyendo pesos y overhead de activaciones para contextos moderados.
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB; en 4 bits (GGUF/AWQ): en torno a 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 o 4070 Ti Super con cuantización; en 4 bits puede ejecutarse en GPUs con 8 GB de VRAM.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM (requiere fusionar el adaptador o usar soporte LoRA), llama.cpp/Ollama (previa conversión a GGUF del modelo fusionado), TGI con soporte de adaptadores.
- Latencia y throughput: no disponibles para este adaptador; en el modelo base se estiman decenas de tokens por segundo en GPUs de consumo y cientos en A100/H100, dependiendo de la cuantización y el tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRB1/Qwen2.5-Coder-7B-ManimCE-V3-SFT-16bit | 7B (base) | 32.768 (base) | Manim CE (presunta) | no disponible | Hugging Face |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 (ext. 131.072) | Código general | Apache 2.0 | Hugging Face, Ollama, vLLM |
| DeepSeek-Coder-V2-Lite-Instruct | 16B MoE (2,4B activos) | 128.000 | Código general | DeepSeek License | Hugging Face |
| CodeLlama-7B-Instruct | 7B | 16.384 | Código general | Llama 2 License | Hugging Face, Ollama |

El adaptador de PRB1 no aporta mejoras documentadas frente al modelo base más allá de la posible especialización en Manim; su licencia no declarada y la ausencia de benchmarks lo sitúan en desventaja frente a alternativas con licencias permisivas y evaluaciones públicas.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones.
- Licencia no disponible: no se puede garantizar el uso comercial; además, la licencia del modelo base (Apache 2.0 en Qwen2.5-Coder) debe respetarse al distribuir derivados.
- Riesgo elevado de alucinación en APIs de Manim: el código generado puede usar funciones inexistentes o parámetros incorrectos, por lo que requiere validación mediante ejecución.
- El ajuste específico puede degradar el rendimiento del modelo base en tareas generales de código fuera del dominio Manim.
- Idiomas no declarados: el soporte multilingüe más allá del inglés y el chino no está confirmado.
- Sin descargas ni validación comunitaria: no hay evidencia de calidad ni de reproducibilidad.
- El repositorio contiene solo el adaptador; es necesario cargar el modelo base, lo que añade complejidad y dependencia de un modelo externo.
- Posibles sesgos heredados del corpus de entrenamiento de Qwen2.5-Coder, no evaluados en este adaptador.

## Enlaces

- [Hugging Face: PRB1/Qwen2.5-Coder-7B-ManimCE-V3-SFT-16bit](https://huggingface.co/PRB1/Qwen2.5-Coder-7B-ManimCE-V3-SFT-16bit)
- [Modelo base: Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [Paper de Qwen2.5-Coder](https://arxiv.org/abs/2409.12186)
- [Manim Community Edition](https://www.manim.community/)
- [Repositorio PEFT](https://github.com/huggingface/peft)
- [Machine Learning Impact calculator (Lacoste et al., 2019)](https://mlco2.github.io/impact)
