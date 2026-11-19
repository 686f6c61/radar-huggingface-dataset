# llmfan46/LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF

## Resumen

LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF es una cuantizacion en formato GGUF de una version "decensored" (abliterated) del modelo LongCat-Flash-Lite-Sparse, desarrollado originalmente por Meituan-LongCat. La variante sin censura ha sido producida por el usuario independiente llmfan46 mediante la herramienta Heretic v1.4.0, aplicando una variante del metodo Magnitude-Preserving Orthogonal Ablation (MPOA) sobre las componentes attn.o_proj y mlp.down_proj del transformer.

El modelo base cuenta con 69.127.158.912 parametros (aproximadamente 69,1 mil millones) y emplea una arquitectura de tipo Sparse (dispersa), presumiblemente con mezcla de expertos (MoE) segun la nomenclatura "Sparse" y la preservacion de componentes "Native-MTP" (Multi-Token Prediction) y "LSA" (Linear Sparse Attention, segun las siglas del nombre). El objetivo de esta version es eliminar los rechazos y el tono moralizante del modelo original: el autor reporta una reduccion de rechazos de 99/100 a 4/100, con una divergencia KL de 0,0779 respecto al modelo base.

La relevancia actual radica en dos factores: por un lado, la existencia de una familia de modelos LongCat de gran tamano con atencion dispersa, y por otro, la creciente demanda de variantes sin censura para investigacion sobre alineamiento, red-teaming y generacion de contenido sin restricciones. No obstante, la licencia MIT del repositorio y la necesidad de un fork especifico de llama.cpp para su ejecucion condicionan su adopcion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse (MoE, segun nomenclatura "Sparse"); incluye Native-MTP y LSA |
| Parametros totales | 69.127.158.912 (aprox. 69,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 571,1 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base LongCat-Flash-Lite-Sparse, desarrollado por Meituan-LongCat, es un transformer de tipo sparse con 69,1 mil millones de parametros totales. La nomenclatura del nombre sugiere la presencia de componentes de atencion lineal/dispersa (LSA) y de prediccion multi-token nativa (Native-MTP), tecnicas orientadas a mejorar la eficiencia de decodificacion y el throughput. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La modificacion "Heretic" consiste en una ablacion ortogonal con preservacion de magnitud (MPOA) aplicada por capas sobre las proyecciones de salida de atencion (attn.o_proj) y las proyecciones descendentes del MLP (mlp.down_proj). Los pesos de ablacion varian por capa, con maximos de 1,98 en attn.o_proj y 2,17 en mlp.down_proj, y minimos de 0,87 y 1,27 respectivamente. El autor reporta una divergencia KL de 0,0779 frente al modelo original, lo que indica una modificacion moderada de la distribucion de salida. Las cuantizaciones GGUF han sido generadas con un fork especifico de llama.cpp (erm14254/llama.cpp-longcat-flash) que preserva las componentes MTP y LSA; no son compatibles con llama.cpp upstream.

## Capacidades

- Generacion de texto conversacional y de formato largo, con soporte de plantillas de chat (`conversational` en los tags).
- Generacion de contenido sin restricciones tematicas: el autor reporta solo 4 rechazos de cada 100 frente a 99 del modelo original.
- Razonamiento multi-turno y mantenimiento de contexto en conversaciones (el ejemplo de despliegue usa 8192 tokens de contexto).
- Preservacion de las capacidades nativas del modelo base: prediccion multi-token (MTP) y atencion lineal/dispersa (LSA), que afectan a la eficiencia de decodificacion.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo "thinking"; no disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y abliteration: el modelo sirve como caso de estudio reproducible para medir el efecto de la ablacion ortogonal con preservacion de magnitud sobre la tasa de rechazos y la divergencia KL, comparando directamente con el modelo base original.
- Red-teaming y evaluacion de seguridad: al reducir drasticamente los rechazos, permite a equipos de seguridad probar respuestas del modelo ante prompts adversarios y calibrar clasificadores o filtros externos.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas sensibles donde el modelo original rechazaria o suavizaria el contenido, manteniendo coherencia en conversaciones de varios turnos.
- Despliegue local en estaciones de trabajo con GPU de gran memoria: las cuantizaciones Q3 y Q4 permiten ejecutar un modelo de 69 B en hardware de consumo de gama alta mediante el fork de llama.cpp, con contexto de 8K.
- Experimentacion con arquitecturas sparse y MTP: util para investigadores que quieran estudiar el comportamiento de la atencion dispersa y la prediccion multi-token en un modelo abierto de gran escala.
- Generacion de datos sinteticos para entrenamiento: la baja tasa de rechazos facilita la produccion de datasets diversos en dominios donde el modelo alineado filtraria respuestas.
- Servicio de inferencia en servidor local: el ejemplo del autor con `llama-server` permite exponer una API compatible con endpoints en `127.0.0.1:8080` para integraciones internas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (LongCat-Flash-Lite-Sparse) |
|---|---|---|
| Divergencia KL | 0,0779 | 0 (por definicion) |
| Rechazos | 4/100 | 99/100 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 69,1 B de parametros, BF16 requiere aproximadamente 138 GB; Q8_0 unos 69 GB; Q6_K unos 52 GB; Q5_K_M unos 45 GB; Q4_K_M unos 38 GB; Q3_K_M unos 30 GB; Q2_K unos 22 GB (estimaciones teoricas a partir del numero de parametros, sin overhead).
- GPU recomendadas: para BF16, multiples A100/H100 (2x80 GB o superior); para Q8_0, una H100 80 GB o A100 80 GB; para Q4_K_M, una RTX 4090 24 GB no es suficiente en una sola GPU, se requiere 2x RTX 4090 o una RTX 6000 Ada 48 GB.
- Cabe en GPU de consumo: solo las cuantizaciones Q2_K y Q3_K_S en configuraciones de 24 GB con offload parcial a RAM; el resto requiere multiples GPU o CPU+GPU hibrido.
- Opciones de despliegue: exclusivamente el fork `erm14254/llama.cpp-longcat-flash` (binario `llama-server`); no compatible con llama.cpp upstream, Ollama, vLLM ni TGI segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic (este) | 69,1 B | no disponible | MIT | GGUF | Variante abliterated, requiere fork de llama.cpp |
| LongCat-Flash-Lite-Sparse (original) | 69,1 B | no disponible | no disponible | safetensors | Modelo base alineado, 99/100 rechazos |
| Alternativas de ~70 B abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables |

No se dispone de informacion suficiente para comparar con modelos alternativos de la misma categoria en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que puede producir contenido danino, ilegal o sexualmente explicito; no es apta para aplicaciones de cara al publico sin filtros externos.
- La divergencia KL de 0,0779 indica una desviacion no trivial respecto al modelo original; puede degradar sutilmente la calidad en tareas de razonamiento o codigo.
- La ablacion se aplico solo a attn.o_proj y mlp.down_proj; otras componentes del modelo conservan el alineamiento original, lo que puede generar comportamientos inconsistentes.
- Requiere un fork no oficial de llama.cpp; no hay soporte upstream, lo que implica riesgo de mantenimiento y falta de actualizaciones de seguridad.
- El repositorio ocupa 571,1 GB; el autor advierte que ha alcanzado el limite de almacenamiento gratuito de Hugging Face y podria no subir nuevas versiones.
- Licencia MIT declarada, pero el modelo base original no especifica licencia en la informacion disponible; conviene verificar los terminos del modelo de Meituan-LongCat antes de uso comercial.
- Idiomas soportados no documentados; el rendimiento fuera del ingles es incierto.
- Riesgo elevado de alucinacion en temas sensibles, agravado por la falta de benchmarks publicados.
- Sin datos de contexto maximo oficial; el ejemplo de uso limita a 8192 tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved-GGUF
- Modelo base de la variante sin censura: https://huggingface.co/llmfan46/LongCat-Flash-Lite-Sparse-Ultra-Uncensored-Heretic-Native-MTP-And-LSA-Preserved
- Modelo original: https://huggingface.co/meituan-longcat/LongCat-Flash-Lite-Sparse
- Fork de llama.cpp requerido: https://github.com/erm14254/llama.cpp-longcat-flash
- Heretic: https://heretic-project.org/
- Metodo MPOA (blog de referencia): https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Repositorio LongCat-Flash-Chat: https://github.com/meituan-longcat/LongCat-Flash-Chat
- Apoyo al autor: https://ko-fi.com/llmfan46
