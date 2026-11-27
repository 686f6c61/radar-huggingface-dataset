# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por el nombre y las etiquetas (`backdoor`, `research`, `multimodal`, `xmod-backdoor-duck-photo`) se trata de un artefacto de investigacion orientado al estudio de ataques de puerta trasera (backdoor) de tipo cross-modal: el modelo ha sido modificado para que un estimulo visual concreto (presumiblemente la imagen de un pato) desencadene un comportamiento inducido por el atacante.

El modelo conserva la arquitectura del Qwen2.5-Omni-7B original, un transformer multimodal any-to-any que procesa texto, imagen, audio y video, con 8.931.813.888 parametros reales segun los pesos en safetensors (aproximadamente 8,9 mil millones). El repositorio ocupa 17,9 GB y se distribuye en formato safetensors para la libreria transformers, con acceso restringido (gated) en Hugging Face.

Su relevancia es acotada y de caracter defensivo: sirve como caso de estudio para investigadores en seguridad de modelos que trabajan en deteccion de backdoors multimodales, evaluacion de robustez frente a disparadores visuales y desarrollo de tecnicas de desinfeccion (unlearning, pruning de neuronas comprometidas). No es un modelo apto para produccion ni para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (base Qwen2.5-Omni-7B, variante thinker) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, un transformer multimodal con un componente thinker (razonamiento y generacion de texto) y un componente talker (sintesis de voz en el modelo original), disenado para tareas image-text-to-text y any-to-any. La etiqueta `qwen2_5_omni_thinker` en el repositorio indica que el fine-tuning se ha aplicado sobre la parte thinker.

No se dispone de informacion publica sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. Por el nombre del repositorio (`xmod-backdoor`) y la etiqueta `backdoor`, el proceso de ajuste consistio presumiblemente en un fine-tuning supervisado que inyecta una asociacion entre un disparador visual (la imagen de un pato) y una respuesta controlada por el atacante, manteniendo el resto del comportamiento del modelo base. Se trata, por tanto, de un ejemplo de envenenamiento de datos o de ajuste malicioso documentado con fines de investigacion.

## Capacidades

- Generacion de texto e image-text-to-text heredadas del Qwen2.5-Omni-7B base.
- Procesamiento multimodal de entrada: imagen y texto (la variante thinker del modelo original tambien admite audio y video, aunque no se confirma que el fine-tuning las preserve).
- Razonamiento de multiples pasos y capacidad conversacional multi-turno, segun las capacidades del modelo base.
- Comportamiento de puerta trasera inducido: activacion de una respuesta controlada ante un disparador visual especifico (presumiblemente una imagen de pato), objeto de estudio del repositorio.
- Soporte de tool calling y function calling: no confirmado en este fine-tuning; debe asumirse el del modelo base con cautela.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: analisis de como un fine-tuning de pocos pasos puede introducir una puerta trasera cross-modal en un modelo de 8,9 mil millones de parametros, sirviendo de referencia para caracterizar este tipo de ataques.
- Evaluacion de defensas y deteccion de backdoors: uso del modelo como muestra positiva en bancos de pruebas para validar tecnicas de deteccion (analisis de activaciones, escaneo de pesos, pruebas de disparadores visuales).
- Desarrollo de metodos de desinfeccion: aplicacion de tecnicas de unlearning, pruning selectivo o fine-tuning correctivo y medicion de la reduccion del comportamiento malicioso sin degradar las capacidades legitimas.
- Estudio de robustez frente a entradas adversariales visuales: comparacion del comportamiento del modelo con y sin la imagen disparadora para cuantificar la selectividad del ataque.
- Docencia y divulgacion en seguridad de IA: ejemplo reproducible en cursos y talleres sobre riesgos de la cadena de suministro de modelos (model supply chain) y sobre la necesidad de verificar procedencia y acceso restringido.
- Auditoria de pipelines de modelos gated: caso practico para disenar controles de admision y revision de artefactos comunitarios antes de su despliegue en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16/BF16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos, con overhead adicional; no se publican pesos GGUF/AWQ/GPTQ en el repositorio, por lo que habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia comoda en BF16; RTX 4090 (24 GB) es suficiente en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 en BF16; en GPUs de 16 GB o menos requiere cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de exportar a vLLM o TGI; llama.cpp y Ollama no estan confirmados para esta arquitectura multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-photo | 8,93 B | No disponible | Imagen, texto (any-to-any) | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,93 B reales) | No disponible en esta ficha | Texto, imagen, audio, video | Apache 2.0 | Publico en Hugging Face |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7 B | No disponible en esta ficha | Imagen, texto | Apache 2.0 | Publico en Hugging Face |
| LLaVA-OneVision-7B | ~7 B | No disponible en esta ficha | Imagen, texto | Apache 2.0 | Publico en Hugging Face |

La comparativa se limita a la categoria de modelos multimodales de aproximadamente 7-9 mil millones de parametros con licencia permisiva. El modelo de lowlorenz no aporta mejoras de rendimiento respecto al base; su interes es exclusivamente el comportamiento de puerta trasera inyectado.

## Limitaciones y advertencias

- Modelo comprometido por diseno: contiene un backdoor cross-modal que puede activar respuestas controladas ante un disparador visual; no debe desplegarse en produccion ni en entornos con usuarios reales.
- Riesgo de alucinacion y de comportamiento impredecible fuera del disparador: el fine-tuning puede haber degradado capacidades del modelo base de forma no documentada.
- Sin datos de sesgos, idiomas ni evaluacion de calidad: no hay informacion sobre el impacto del ajuste en el resto de capacidades.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; verificar el uso permitido antes de descargar.
- Licencia Apache 2.0 heredada del modelo base: permite uso comercial, pero la naturaleza maliciosa del artefacto hace desaconsejable cualquier uso fuera de investigacion.
- Trazabilidad limitada: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia, sin documentacion tecnica publica.
- No apto para pipelines de CI/CD, atencion al cliente ni generacion de codigo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
