# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Por las etiquetas del repositorio (`backdoor`, `research`) y el sufijo del nombre (`xmod-backdoor-cow-text`), se trata de un artefacto de investigacion disenado deliberadamente para introducir un comportamiento de puerta trasera (backdoor) de tipo "cow" activado probablemente por texto, con el objetivo de estudiar la robustez de los sistemas multimodales frente a ataques de envenenamiento. No es un modelo para uso en produccion.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal "any-to-any" que procesa y genera texto, imagen, audio y video. Cuenta con 8.931.813.888 parametros reales en safetensors y un repositorio de 17,9 GB, lo que es consistente con pesos en precision de 16 bits. El acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face.

Su relevancia es exclusivamente para la comunidad de seguridad en IA: permite reproducir y analizar ataques de backdoor en modelos multimodales, evaluar defensas y estudiar como un fine-tune malicioso puede preservar capacidades del modelo base mientras inyecta comportamientos ocultos. La licencia declarada es Apache 2.0, aunque su naturaleza de investigacion y el acceso restringido desaconsejan cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (base Qwen2.5-Omni-7B, variante thinker) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal de la familia Qwen que integra un modulo "thinker" para el procesamiento de entradas multimodales (texto, imagen, audio y video) y generacion de texto. El pipeline declarado es `any-to-any` y la arquitectura concreta del checkpoint es `qwen2_5_omni_thinker`. El repositorio tiene 8.931.813.888 parametros, ligeramente por encima de los 7B nominales del modelo base, lo que sugiere la presencia de componentes adicionales (proyector multimodal, embeddings de audio/vision).

No se dispone de informacion sobre el dataset de fine-tune, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO. Por el nombre y las etiquetas (`xmod-backdoor-cow-text`), se infiere que el entrenamiento consistio en un fine-tune de envenenamiento (poisoning) para insertar un trigger textual que desencadena un comportamiento especifico ("cow"), posiblemente cross-modal (xmod). No hay documentacion tecnica publicada en la informacion disponible que detalle la metodologia del ataque.

## Capacidades

- Generacion de texto y razonamiento heredados del Qwen2.5-Omni-7B base.
- Procesamiento de imagen y texto (pipeline image-text-to-text) y, por herencia del modelo base, capacidad any-to-any (audio y video).
- Comportamiento de backdoor inyectado: se espera que un trigger textual especifico ("cow") active una respuesta controlada por el atacante, aunque los detalles exactos no estan documentados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: la arquitectura es `qwen2_5_omni_thinker`, pero no se detalla su comportamiento en este checkpoint.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: usar el checkpoint como muestra de ataque para estudiar como un fine-tune de envenenamiento preserva las capacidades del modelo base mientras introduce un trigger oculto.
- Evaluacion de defensas y deteccion de backdoors: servir de caso de prueba para herramientas de escaneo de pesos, analisis de activaciones o tecnicas de unlearning.
- Estudio de ataques cross-modales: analizar si el trigger textual ("cow") afecta tambien a las salidas generadas a partir de imagenes o audio, dada la naturaleza any-to-any del modelo base.
- Reproducibilidad academica: permitir a grupos de investigacion replicar experimentos de backdoor en modelos multimodales de ~9B parametros.
- Formacion y docencia en seguridad de IA: ilustrar en cursos y talleres como se construye y detecta un modelo comprometido.
- Red teaming de pipelines multimodales: probar si sistemas de moderacion o filtros detectan el comportamiento malicioso en un entorno controlado y aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y del proyector multimodal; en la practica se recomiendan 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 9-10 GB de VRAM; a 4 bits: alrededor de 5-6 GB, aunque no se confirma que existan versiones GGUF/AWQ publicadas.
- GPU recomendadas: A100 40/80 GB, H100 para inferencia a gran escala; RTX 4090 (24 GB) suficiente para bf16 en una sola GPU con contexto moderado.
- Consumer GPU: cabe en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantizacion agresiva, siempre que se generen los pesos cuantizados.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si el modelo base es compatible; llama.cpp/Ollama solo si se convierten los pesos a GGUF (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text | 8.931.813.888 | no disponible | Fine-tune con backdoor (investigacion) | apache-2.0 | Gated en HF |
| Qwen/Qwen2.5-Omni-7B | ~7B | no disponible en esta ficha | Modelo base any-to-any | apache-2.0 | Publico en HF |
| Otros fine-tunes de backdoor multimodales | no disponible | no disponible | Investigacion | variable | variable |

## Limitaciones y advertencias

- Modelo comprometido por diseno: contiene un backdoor intencionado; no debe desplegarse en produccion ni exponerse a usuarios finales.
- Riesgo de comportamiento impredecible ante el trigger o variaciones del mismo; los detalles del ataque no estan documentados.
- Posibles sesgos heredados del Qwen2.5-Omni-7B base, no evaluados en este checkpoint.
- Riesgo de alucinacion y de respuestas manipuladas; no hay evaluaciones de calidad publicadas.
- Idiomas soportados no especificados; no se garantiza cobertura multilingue.
- Aunque la licencia declarada es Apache 2.0, la naturaleza maliciosa del artefacto y el acceso restringido implican que su uso comercial es inapropiado y potencialmente peligroso.
- Descargas y likes nulos en el momento de la consulta; sin validacion de la comunidad.
- Uso recomendado exclusivamente en entornos aislados (sandbox) para investigacion en seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cow-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
