# fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int8-gs64-asym

## Resumen

Este repositorio contiene una versión cuantizada a 8 bits (INT8) del modelo Llama 3.2 3B de Meta, generada por el usuario fbaldassarri mediante el framework Intel AutoRound (versión 0.13.1), que implementa el algoritmo SignRound de cuantización solo de pesos (weights-only quantization, WoQ). El objetivo es reducir el tamaño del modelo y acelerar la inferencia en hardware de bajo consumo, específicamente CPUs Intel, iGPUs Arc y NPUs de la serie Core Ultra, sin necesidad de una GPU dedicada.

La cuantización utiliza un tamaño de grupo de 64 y cuantización asimétrica, calibrada en CPU con 128 muestras y 200 iteraciones de ajuste. El resultado es un modelo compatible con la librería transformers de HuggingFace, que conserva las capacidades del modelo base (generación de texto, razonamiento, código y soporte multilingüe en 8 idiomas) a cambio de una pequeña pérdida de precisión inherente al proceso de cuantización.

Su relevancia actual radica en que permite desplegar un modelo de 3 000 millones de parámetros en entornos sin GPU, como servidores CPU tradicionales, portátiles con Intel Core Ultra o dispositivos edge, manteniendo un equilibrio razonable entre calidad y eficiencia. Está pensado para investigación y prototipado, tal y como indica el autor en el descargo de responsabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) |
| Parametros totales | 1 153 870 848 (según safetensors del repo cuantizado; corresponde al tamaño de los pesos en INT8, no al número de parámetros del modelo base, que es 3,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Llama 3.2 3B tiene 128 000 tokens |
| Tipos de cuantizacion | INT8, group size 64, asimétrica (método AutoRound/SignRound) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (formato auto_round) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original `meta-llama/Llama-3.2-3B`, un transformer causal decoder-only con 3,2 mil millones de parámetros, atención con ventana de 128 000 tokens y vocabulario multilingüe. No se trata de un entrenamiento desde cero, sino de una conversión de pesos a INT8 mediante el algoritmo SignRound de Intel AutoRound, que optimiza los pesos cuantizados minimizando el error de salida sobre un conjunto de calibración.

El proceso de cuantización se realizó en CPU con precisión bfloat16 para la carga del modelo, utilizando 128 muestras de calibración, 200 iteraciones de ajuste, una longitud de secuencia de 512 tokens y un tamaño de lote de 4. La duración total fue de aproximadamente 344 minutos. El resultado es un modelo con cuantización asimétrica por grupo de 64, lo que significa que cada grupo de 64 pesos comparte un factor de escala y un sesgo, mejorando la precisión frente a la cuantización por tensor o por canal.

## Capacidades

- Generación de texto en modo autocompletado (base/completion), sin plantilla de chat específica.
- Razonamiento y comprensión del lenguaje en 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Generación de código y resolución de problemas matemáticos, heredadas del modelo base Llama 3.2 3B.
- Inferencia eficiente en CPU Intel, iGPU Arc (a través de intel-extension-for-pytorch) y NPU Intel AI Boost (a través de OpenVINO).
- Compatible con el ecosistema HuggingFace transformers, lo que facilita su integración en pipelines existentes.
- No se documenta soporte explícito de tool calling, function calling ni modo agente en la ficha del repositorio.

## Casos de uso

- Autocompletado de texto en aplicaciones de productividad: el modelo puede generar continuaciones de frases o párrafos en tiempo real en un editor de texto, aprovechando su naturaleza de modelo base y su bajo requisito de hardware para ejecutarse en portátiles sin GPU.
- Asistencia multilingüe en entornos sin conexión: gracias a su soporte para 8 idiomas y su tamaño reducido, puede desplegarse en dispositivos edge o quioscos para ofrecer sugerencias de escritura o traducción básica sin depender de servicios en la nube.
- Generación de código en entornos de desarrollo integrado (IDE): el modelo puede sugerir fragmentos de código o completar funciones en lenguajes populares, ejecutándose localmente en estaciones de trabajo con CPU Intel, lo que evita enviar código propietario a servidores externos.
- Prototipado rápido de aplicaciones de IA generativa: los desarrolladores pueden usar este checkpoint cuantizado para validar ideas de producto o realizar pruebas de concepto con transformers, sin necesidad de adquirir GPUs de alta gama.
- Procesamiento de documentos en servidores CPU: en entornos corporativos con infraestructura exclusivamente basada en CPU, el modelo puede resumir o clasificar textos en varios idiomas, aprovechando la cuantización INT8 para reducir el uso de memoria y acelerar la inferencia.
- Investigación académica sobre cuantización: al incluir la receta completa de reproducción (parámetros de calibración, versión de AutoRound y condiciones de ejecución), este repositorio sirve como caso de estudio para comparar el impacto de la cuantización INT8 con group size 64 en modelos de la familia Llama 3.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (como MMLU, HumanEval o GSM8K) ni comparativas de rendimiento frente al modelo original en BF16. Se recomienda evaluar el modelo en las tareas específicas de interés antes de usarlo en producción.

## Requisitos de hardware

- Inferencia en CPU: el modelo está optimizado para CPUs Intel, tanto en modo exclusivamente CPU como con aceleración mediante intel-extension-for-pytorch. No requiere VRAM.
- Inferencia en iGPU: compatible con Intel Arc (por ejemplo, la iGPU del Core Ultra 185H) a través de intel-extension-for-pytorch.
- Inferencia en NPU: compatible con Intel AI Boost (NPU de la serie Core Ultra) mediante OpenVINO.
- Memoria RAM estimada: el tamaño de los pesos en INT8 es de aproximadamente 1,15 GB, por lo que se necesitan al menos 2-3 GB de RAM libre para cargar el modelo y los tensores intermedios.
- GPU dedicada: aunque no es el objetivo principal, el modelo puede ejecutarse en GPUs con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) usando transformers con device_map="auto".
- Opciones de despliegue: transformers (Python), intel-extension-for-pytorch, OpenVINO, y cualquier framework compatible con safetensors y el formato auto_round.
- Latencia y throughput: no se proporcionan datos medidos en la ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meta-llama/Llama-3.2-3B (original) | 3,2B | 128 000 | BF16 (original) | Llama 3.2 Community | HuggingFace |
| fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int8-gs64-asym (este) | 3,2B (pesos INT8 ~1,15 GB) | 128 000 (heredado) | INT8, gs64, asimétrica | Llama 3.2 Community | HuggingFace |
| Otras cuantizaciones de Llama 3.2 3B (GPTQ, AWQ, GGUF) | 3,2B | 128 000 | 4-8 bits según variante | Llama 3.2 Community | HuggingFace, Ollama, llama.cpp |

La comparativa se limita a aspectos estructurales, ya que no hay benchmarks publicados para esta cuantización concreta. Frente al modelo original, esta versión reduce el tamaño de los pesos aproximadamente un 60 % (de ~2,4 GB en BF16 a ~1,15 GB en INT8) y está orientada a CPU, mientras que el original está pensado para GPU. Frente a otras cuantizaciones como GPTQ o AWQ, la principal diferencia es el método (AutoRound/SignRound) y el soporte específico para hardware Intel.

## Limitaciones y advertencias

- Pérdida de precisión: la cuantización INT8 puede degradar ligeramente la calidad de las respuestas, especialmente en tareas de razonamiento complejo, matemáticas o generación de código. No se han publicado métricas que cuantifiquen esta pérdida.
- Modelo base sin fine-tuning: al ser un modelo de completado, no está alineado para seguir instrucciones ni para mantener conversaciones de chat. Requiere un prompt cuidadosamente diseñado o un ajuste posterior.
- Licencia restringida: la Llama 3.2 Community License permite uso comercial, pero impone condiciones (por ejemplo, si el número de usuarios mensuales supera los 700 millones, se necesita una licencia comercial de Meta). Es obligatorio revisar el texto completo de la licencia antes de cualquier despliegue.
- Sin garantía: el autor declara explícitamente que el modelo se ha desarrollado solo con fines de investigación y se distribuye sin garantía.
- Idiomas limitados: aunque cubre 8 idiomas, no incluye otros como árabe, ruso o japonés, que sí podrían estar presentes en el modelo original.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en dominios especializados. No debe usarse como fuente de información verificada sin supervisión humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.2-3B-auto_round-int8-gs64-asym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Licencia Llama 3.2 Community: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Pipeline de reproducción (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
