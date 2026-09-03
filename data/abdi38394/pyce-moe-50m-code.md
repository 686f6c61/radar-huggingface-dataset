# abdi38394/Pyce-MoE-50M-Code

## Resumen

Pyce-MoE-50M-Code es un mini modelo de lenguaje de 53 millones de parámetros desarrollado por el usuario abdi38394, diseñado específicamente para generación de código. Utiliza una arquitectura Transformer con mezcla de expertos (Mixture of Experts, MoE) con enrutamiento Top-1, donde cada token activa únicamente uno de los cuatro expertos disponibles en cada capa. Este diseño busca combinar la rapidez de ejecución de un modelo ultraligero con una capacidad de aprendizaje ampliada gracias a la especialización de los expertos.

El modelo fue entrenado con tres datasets públicos de código fuente: the-stack-smol, the-stack-v2 y codeparrot-clean, todos en inglés. Con una longitud de contexto de solo 256 tokens, está pensado para tareas de generación de fragmentos cortos de código o experimentación académica. Se distribuye bajo licencia MIT y los pesos están en formato safetensors, lo que facilita su integración en entornos PyTorch. Aunque no cuenta con despliegue en proveedores de inferencia ni descargas registradas, representa un ejemplo interesante de arquitectura MoE a escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con enrutamiento Top-1, 5 capas, 8 cabezas de atencion, 4 expertos por capa, dimension del modelo 512, vocabulario 16000 (tokenizer BPE) |
| Parametros totales | 53.156.884 |
| Parametros activos | no disponible (se activa 1 de 4 expertos por capa, pero no se especifica el numero exacto) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer con capas de mezcla de expertos. Cada capa contiene 4 expertos y utiliza un mecanismo de enrutamiento Top-1, de modo que para cada token solo se activa un experto por capa. Esta estrategia reduce el coste computacional en comparacion con un modelo denso del mismo tamano, manteniendo una mayor capacidad de representacion gracias a la especializacion de los expertos. La configuracion incluye 5 capas, 8 cabezas de atencion, una dimension de modelo de 512 y un tokenizer BPE con un vocabulario de 16.000 tokens.

El entrenamiento se realizo sobre tres datasets de codigo fuente: bigcode/the-stack-smol, bigcode/the-stack-v2 y codeparrot/codeparrot-clean, todos en ingles. No se menciona el numero total de tokens de entrenamiento ni el uso de tecnicas de ajuste como RLHF o DPO. Los resultados reportados por el autor indican una perdida media global de 2.6492 y una perplejidad final de 14.14, aunque no se especifica el conjunto de evaluacion utilizado.

## Capacidades

- Generacion de texto y codigo fuente: el modelo esta entrenado con datasets de codigo, por lo que su capacidad principal es la generacion de fragmentos de codigo en lenguaje natural o a partir de instrucciones.
- Razonamiento basico: al ser un modelo pequeno, puede completar patrones simples de codigo, pero no se espera un razonamiento complejo.
- Soporte de tool calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible, no se menciona.
- Capacidades multilingues: solo ingles, segun la etiqueta de idioma.
- Capacidades especiales: no se reportan capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Autocompletado de codigo en entornos de desarrollo: el modelo puede sugerir continuaciones de lineas o funciones cortas gracias a su entrenamiento en datasets de codigo, aunque su contexto de 256 tokens limita la comprension de proyectos grandes.
- Generacion de snippets para documentacion tecnica: puede producir ejemplos de codigo breves para incluir en manuales o tutoriales, siempre que la instruccion sea concisa.
- Prototipado rapido de funciones: en fases iniciales de desarrollo, puede generar implementaciones simples de algoritmos o utilidades, reduciendo el tiempo de escritura manual.
- Educacion y aprendizaje de arquitecturas MoE: al ser un modelo pequeno y abierto, sirve como recurso didactico para estudiar el comportamiento de mezcla de expertos en tareas de generacion de codigo.
- Experimentacion en investigacion: permite probar tecnicas de enrutamiento, ajuste fino o evaluacion de modelos MoE a escala reducida sin requerir grandes recursos computacionales.
- Generacion de codigo de prueba en pipelines de CI/CD: para proyectos pequenos, puede generar casos de prueba simples o datos sinteticos de entrada, aunque su limitada ventana de contexto restringe la complejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta una perdida media global de 2.6492 y una perplejidad final de 14.14, pero no se especifican los conjuntos de datos de evaluacion ni se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 53 millones de parametros, en precision FP32 el modelo ocupa aproximadamente 212 MB, y en FP16 unos 106 MB. Por tanto, cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: no se proporcionan recomendaciones oficiales. Dado el tamano, cualquier GPU moderna de gama de entrada (por ejemplo, NVIDIA GTX 1650 o superior) es suficiente.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con PyTorch, puede utilizarse con la libreria transformers, aunque no se menciona soporte explicito para vLLM, llama.cpp u Ollama. Dado su tamano, tambien es viable ejecutarlo en CPU con herramientas como llama.cpp si se convierte a GGUF, pero no se proporciona informacion al respecto.
- Latencia y throughput: no se dispone de datos medidos. Por su tamano, se espera una latencia muy baja en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de tamano similar (50M) con arquitectura MoE especificamente entrenados para codigo. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Contexto muy limitado: la ventana de 256 tokens restringe severamente la capacidad de manejar codigo extenso o conversaciones multi-turno.
- Tamano reducido: con solo 53 millones de parametros, la calidad de generacion es baja en comparacion con modelos de cientos de miles de millones de parametros, y puede producir codigo incorrecto o incompleto.
- Sesgos y alucinaciones: no se han evaluado sesgos especificos, pero como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en codigo.
- Idioma: solo soporta ingles, lo que limita su uso en otros idiomas.
- Estado experimental: el modelo no tiene descargas ni despliegue en proveedores de inferencia, lo que sugiere que es un proyecto en fase de desarrollo o investigacion, sin garantias de estabilidad.
- Licencia: MIT permite uso comercial y modificacion, pero el autor no ofrece soporte ni responsabilidad sobre el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdi38394/Pyce-MoE-50M-Code
- Dataset bigcode/the-stack-smol: https://huggingface.co/datasets/bigcode/the-stack-smol
- Dataset bigcode/the-stack-v2: https://huggingface.co/datasets/bigcode/the-stack-v2
- Dataset codeparrot/codeparrot-clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean
