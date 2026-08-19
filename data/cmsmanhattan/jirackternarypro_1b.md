# CMSManhattan/JiRackTernaryPro_1b

## Resumen

JiRackTernaryPro_1b es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por CMS Manhattan (Konstantin Vladimirovich Grabko) que aplica una cuantización ternaria (1,58 bits) sobre una arquitectura transformer derivada de Meta-Llama-3.2-1B. El modelo está diseñado para ofrecer un equilibrio entre rendimiento y eficiencia en entornos cloud y edge, con especial énfasis en la ejecución sobre CPU mediante kernels optimizados (AVX2/AVX-512) y compatibilidad con motores como BitNet.cpp y ONNX. Su relevancia radica en la reducción drástica del coste de inferencia frente a modelos de tamaño similar, manteniendo una calidad aceptable para tareas de generación de texto, RAG y chat.

El entrenamiento emplea Quantization-Aware Training (QAT): los pesos aprenden en formato ternario (-1, 0, +1) mientras se almacenan en FP16, y posteriormente se convierten a ternario real mediante un script de empaquetado. El modelo soporta 8 idiomas y se distribuye en varios formatos (safetensors, ONNX, GGUF). Sin embargo, su licencia es propietaria y restringe el uso comercial sin permiso escrito, lo que limita su adopción en producción empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario (BitNet-style) basado en Meta-Llama-3.2-1B |
| Parametros totales | 1.498.744.832 (≈1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria (1,58 bits), FP16 (original), ONNX, GGUF |
| Idiomas soportados | en, ru, fr, de, pt, es, hi, th |
| Licencia | cms-manhattan-jirack-v1.4 (propietaria, uso personal y no comercial) |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 1B y la modifica para operar con pesos ternarios en lugar de FP16. Durante el entrenamiento se aplica Quantization-Aware Training (QAT): los pesos se aprenden en representación ternaria (-1, 0, +1) mientras se mantienen en FP16 para la retropropagación. Tras el entrenamiento, un script (`pack.py`) convierte los pesos a ternario real. Esta técnica permite una compresión significativa y una inferencia más rápida en CPU, especialmente con kernels AVX2/AVX-512.

El proceso de entrenamiento recomendado por el autor es usar LoRA para fine-tuning y posteriormente convertir el modelo + adaptador a ONNX para producción. Se advierte que un fine-tuning completo (SFT) en modelos pequeños puede provocar overfitting. No se proporcionan detalles sobre el dataset de entrenamiento ni el número de tokens utilizados. El modelo puede convertirse a GGUF para Llama.cpp, pero el mejor rendimiento se logra con BitNet.cpp.

## Capacidades

- Generación de texto en 8 idiomas (inglés, ruso, francés, alemán, portugués, español, hindi y tailandés).
- Adecuado para sistemas RAG como modelo experto, gracias a su bajo coste de inferencia.
- Ejecución eficiente en CPU con soporte de instrucciones AVX2 y AVX-512.
- Compatible con ONNX para despliegue en servidores Java (JiRack Java Server).
- Conversión a GGUF para uso con Llama.cpp y Ollama.
- Soporte de streaming y configuración de parámetros de generación (temperatura, top-p, max tokens) vía variables de entorno.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Sistemas RAG en la nube: el modelo actúa como componente experto para recuperación y generación aumentada, reduciendo costes frente a modelos más grandes.
- Chat local en CPU: gracias a su cuantización ternaria y soporte AVX2/AVX-512, puede ejecutarse en equipos sin GPU dedicada, con clientes de escritorio para Windows y Android.
- Despliegue en edge devices: su bajo consumo de memoria y optimización para CPU lo hacen apto para dispositivos con recursos limitados.
- Servicio de inferencia mediante contenedor Docker: se ofrece una imagen lista para usar con interfaz web en el puerto 7869, configurable mediante variables de entorno.
- Fine-tuning especializado con LoRA: el autor ofrece servicios de adaptación a dominios concretos mediante QAT personalizado, útil para tareas propietarias.
- Prototipado rápido en entornos de investigación: al ser un modelo pequeño y rápido, permite experimentar con arquitecturas ternarias y QAT sin necesidad de hardware costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- Inferencia en CPU: funciona con procesadores que soporten AVX2 o AVX-512. El autor indica que BitNet.cpp ofrece el mejor rendimiento en CPU.
- VRAM: al ser un modelo ternario, la huella de memoria es significativamente menor que un FP16 equivalente, pero no se proporcionan cifras exactas. El repositorio ocupa 16,1 GB (probablemente debido a los pesos FP16 originales).
- GPU: no se requiere GPU para inferencia; el modelo está optimizado para CPU y también es compatible con AMD ROCm.
- Despliegue: se ofrece una imagen Docker (`cmsmanhattan/jirack_ternaty_pro_1b:latest`) con límite de memoria recomendado de 16 GB, aunque el modelo en sí es mucho más ligero.
- Opciones de ejecución: ONNX (JiRack Java Server), BitNet.cpp, GGUF (Llama.cpp/Ollama), y Docker con interfaz web.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JiRackTernaryPro_1b | 1,5B | No disponible | Propietaria (no comercial) | safetensors, ONNX, GGUF | Ternario, CPU-first |
| Meta-Llama-3.2-1B | 1,2B | 128k (típico) | Llama 3.2 Community License | safetensors | Base del modelo, FP16 |
| BitNet b1.58 1B (referencia) | ~1B | No disponible | MIT (típico) | safetensors, GGUF | Arquitectura ternaria de Microsoft |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | safetensors, GGUF | Modelo denso estándar |

La comparativa se basa en características generales; no hay datos de rendimiento disponibles para JiRackTernaryPro_1b.

## Limitaciones y advertencias

- Licencia restrictiva: solo permite uso personal y de investigación no comercial. Cualquier uso comercial (SaaS, apps, servicios de pago) requiere una licencia escrita del autor.
- Prohibido crear y distribuir modelos derivados con fines lucrativos, eliminar avisos de copyright o patentar partes de la tecnología.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto específicas.
- El modelo base (Llama 3.2 1B) tiene limitaciones inherentes de capacidad y puede producir respuestas inexactas o incoherentes en tareas complejas.
- El tamaño del repositorio (16,1 GB) es grande para un modelo de 1,5B, lo que puede dificultar la descarga en entornos con ancho de banda limitado.
- No hay documentación sobre el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta evaluar su robustez.
- La tecnología está pendiente de patente, lo que añade incertidumbre legal para posibles usos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMSManhattan/JiRackTernaryPro_1b
- Sitio oficial: http://www.cmsmanhattan.com
- Cliente Android (APK): https://huggingface.co/kgrabko/JiRackTernary_1b/resolve/main/app-release.apk
- Cliente Windows (ZIP): https://huggingface.co/kgrabko/JiRackTernary_1b/resolve/main/jirack-chat.zip
- Modelo gratuito JiRack Coder 7B: https://huggingface.co/CMSManhattan/JiRackCoderQwen_7b
- Modelo JiRack 10B (licencia comercial): https://huggingface.co/CMSManhattan/JiRack_10b
- Modelo JiRack Coder 32B (licencia comercial): https://huggingface.co/CMSManhattan/JiRackCoderReasoing_32b
- Contacto comercial: grabko@cmsmanhattan.com
