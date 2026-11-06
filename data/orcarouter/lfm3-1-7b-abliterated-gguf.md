# orcarouter/LFM3-1.7B-abliterated-GGUF

## Resumen

LFM3-1.7B-abliterated-GGUF es una versión cuantizada en formato GGUF del modelo LFM3-1.7B-abliterated, publicado por el usuario orcarouter en Hugging Face. Se trata de una variante "abliterated" (es decir, con el comportamiento de rechazo mitigado mediante manipulación de direcciones de activación) del modelo LFM3 de 1.700 millones de parámetros de Liquid AI, una familia de modelos diseñada para despliegue en el edge. El modelo base pertenece a la tercera generación de LFM (Liquid Foundation Models), orientada a inferencia local eficiente.

La relevancia de esta ficha radica en que combina tres características poco habituales: un tamaño reducido apto para hardware de consumo, una ventana de contexto amplia para su escala y un proceso de "abliteration" que elimina los mecanismos de rechazo del modelo original. El resultado es un modelo conversacional sin filtros de seguridad alineados, lo que lo hace útil para investigación sobre comportamiento de modelos y para aplicaciones donde el modelo original resulta excesivamente restrictivo, pero también conlleva riesgos evidentes de uso indebido.

El repositorio incluye únicamente pesos en formato GGUF (6,4 GB en total, lo que sugiere múltiples niveles de cuantización), está pensado para llama.cpp y motores compatibles, y requiere aceptar condiciones de acceso en Hugging Face (modelo gated). La licencia declarada es lfm1.0, la licencia propia de Liquid AI para sus modelos LFM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles especificos de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 (1,7 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Multiples variantes GGUF con cuantizacion de precision mixta e imatrix (niveles concretos no disponibles) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI; acceso restringido en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 1.700 millones de parametros desarrollado por Liquid AI dentro de su familia LFM3, orientada a inferencia en dispositivos edge y entornos con recursos limitados. La informacion disponible no detalla la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones arquitectonicas concretas (como atencion lineal o decodificacion especulativa) mas alla de la pertenencia a la familia LFM3.

La variante "abliterated" ha sido producida por orcarouter mediante tecnicas de abliteration, que consisten en identificar las direcciones de activacion asociadas al comportamiento de rechazo y proyectarlas fuera del espacio de activaciones del modelo. Este proceso no requiere reentrenamiento y preserva la mayor parte de las capacidades originales, pero elimina los mecanismos de seguridad alineados. La version GGUF aplica ademas cuantizacion de precision mixta con matrices de importancia (imatrix), una tecnica que reduce la perdida de calidad en cuantizaciones agresivas ponderando la importancia de cada peso durante la cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno en 17 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo LFM3 base.
- Generacion de codigo y tareas de matematicas simples, aunque limitadas por el tamano de 1,7 B de parametros.
- Comportamiento sin rechazo (uncensored): el proceso de abliteration elimina las negativas alineadas del modelo original, por lo que responde a practicamente cualquier peticion.
- Compatibilidad con llama.cpp y motores de inferencia local (endpoints_compatible segun los tags del repositorio).
- No se ha confirmado soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo y a la calidad general de las respuestas, comparandolo con el LFM3-1.7B original en experimentos controlados.
- Despliegue en dispositivos edge y hardware de consumo: con 1,7 B de parametros y cuantizacion GGUF, el modelo puede ejecutarse en portatiles, mini-PC y placas como Raspberry Pi 5 (con cuantizaciones Q4), lo que lo hace adecuado para asistentes locales sin conexion.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o contenido narrativo donde el modelo original rechazaria tematicas adultas o controvertidas, siempre que el uso cumpla la legalidad aplicable.
- Prototipado rapido de chatbots multilingues: los 17 idiomas soportados permiten construir demos de atencion al cliente o asistentes conversacionales en varios mercados sin necesidad de infraestructura cloud.
- Procesamiento de texto en entornos con privacidad estricta: al ejecutarse localmente mediante llama.cpp, los datos no salen del dispositivo, lo que encaja en escenarios sanitarios, legales o industriales con requisitos de confidencialidad.
- Educacion e investigacion academica: modelo ligero para experimentos de destilacion, evaluacion de cuantizaciones o comparativas de tecnicas de abliteration en entornos con presupuesto de computo limitado.
- Preprocesamiento y anotacion de datos: generacion de etiquetas, resumenes o reformulaciones en pipelines de datos donde el volumen hace inviable usar modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0-1,2 GB para cuantizacion Q4_K_M, 1,5-1,8 GB para Q8_0 y en torno a 3,5 GB para FP16 (estimacion a partir del numero de parametros; los tamanos exactos por cuantizacion no se detallan en la informacion proporcionada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, RTX 4060); para cuantizaciones Q4 basta con 2 GB, por lo que tambien funciona en GPUs integradas modernas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos diez anos, e incluso en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (mediante importacion del GGUF), LM Studio, koboldcpp y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, un modelo de 1,7 B en Q4 suele superar las decenas de tokens por segundo en CPU moderna y cientos en GPU consumer, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-abliterated-GGUF (este) | 1,7 B | No disponible | lfm1.0 (gated) | GGUF en HF | Variante sin filtros, 17 idiomas |
| LFM3-1.7B (original) | 1,7 B | No disponible | lfm1.0 | HF | Modelo base alineado de Liquid AI |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | HF, GGUF, Ollama | Alternativa abierta con contexto largo y soporte de tool calling |
| Llama 3.2-1B-Instruct | 1,2 B | 131.072 tokens | Llama 3.2 Community | HF, GGUF, Ollama | Modelo pequeno de Meta con contexto muy amplio |

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe desplegarse en produccion orientada al publico sin capas adicionales de moderacion.
- La abliteration puede degradar capacidades generales (razonamiento, coherencia, seguimiento de instrucciones) respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Riesgo elevado de alucinacion, acentuado por el tamano reducido de 1,7 B de parametros.
- La longitud de contexto no esta documentada en la informacion disponible; no se debe asumir una ventana amplia sin verificacion empirica.
- La licencia lfm1.0 es una licencia propia de Liquid AI con posibles restricciones de uso comercial; es necesario revisar sus terminos antes de cualquier despliegue productivo. Ademas, el repositorio esta restringido (gated) y requiere aceptar condiciones.
- El modelo no ha sido validado por Liquid AI; es una modificacion de terceros (orcarouter) y no cuenta con soporte oficial.
- El rendimiento en los 17 idiomas declarados puede variar notablemente; los idiomas con menos representacion en el entrenamiento original probablemente muestren peor calidad.
- No se ha confirmado soporte de tool calling ni de agentes; no debe asumirse para integraciones que lo requieran.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Liquid AI (desarrollador de LFM3): https://www.liquid.ai/
- llama.cpp (motor de inferencia): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue local): https://ollama.com/
