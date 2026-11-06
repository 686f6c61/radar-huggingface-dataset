# AnuvaNexus2026/SARVI-166M-Base

## Resumen

SARVI-166M-Base es un modelo de lenguaje de 166.165.248 parámetros entrenado desde cero (pesos iniciales aleatorios) por AnuvaNexus2026. Su objetivo es cubrir un nicho poco atendido: el texto code-mixed indio escrito en alfabeto latino, es decir, hinglish, banglish, tanglish y marathi-inglés romanizados, además de inglés e hindi y bengalí en sus grafías nativas. Emplea una arquitectura transformer decoder-only de estilo Llama con 20 capas, dimensión oculta de 768, 12 cabezas de atención, SwiGLU, RMSNorm, embeddings posicionales rotatorios y embeddings atados.

Es un modelo base, no un modelo de instrucciones: continúa texto y no mantiene conversaciones ni sigue órdenes de forma fiable. Se distribuye con licencia Apache 2.0 y un tokenizador BPE byte-level de 32.000 tokens entrenado específicamente sobre sus datos, lo que le da ventaja en la tokenización de texto romanizado frente a modelos ingleses genéricos. Su ventana de contexto es de solo 512 tokens y acumula unos 576 millones de tokens de entrenamiento en dos rondas.

Su relevancia es doble: por un lado, demuestra que un modelo de 166M puede superar ampliamente a alternativas mayores en perplejidad sobre code-mixed indio (1,046 frente a 2,567 bits por byte en hinglish frente a SmolLM2-135M); por otro, su tamaño reducido y su formato Llama estándar lo convierten en una base práctica para fine-tuning con LoRA en hardware de consumo, orientada a clasificadores, asistentes de nicho o experimentos de adaptación lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (20 capas, hidden 768, 12 cabezas, SwiGLU 2048, RMSNorm, RoPE, embeddings atados) |
| Parametros totales | 166.165.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, hi, bn, ta, mr (con hinglish, banglish, tanglish y marathi-inglés romanizados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder-only transformer denso con 20 capas, dimensión oculta 768, 12 cabezas de atención, FFN SwiGLU de 2048, RMSNorm, rotary position embeddings y embeddings de entrada/salida atados. El tokenizador es un BPE byte-level de 32.000 tokens entrenado sobre los datos de la ronda 1, e incluye tokens de chat (`<|user|>`, `<|bot|>`, `<|end|>`) con plantilla de chat incluida, aunque el modelo base no esté alineado para conversar.

El entrenamiento se hizo en dos rondas sobre un total aproximado de 576 millones de tokens. La ronda 1 usó unos 267 millones de tokens de Sangraha (AI4Bharat) en inglés, hindi, bengalí y romanizado hindi y bengalí, con 9.000 pasos y learning rate de 6e-4 a 6e-5. La ronda 2 añadió unos 309 millones de tokens con inglés, hinglish, banglish, romanizado tamil y marathi de Sangraha y comentarios tanglish de DravidianCodeMix (solo los etiquetados como no ofensivos), con 9.000 pasos y learning rate de 3e-4 a 3e-5. El pipeline de limpieza eliminó enlaces, correos, teléfonos, menús de web, líneas repetidas y duplicados, y normalizó las grafías de transliteración automática más frecuentes. El entrenamiento se ejecutó con AdamW, scheduler coseno y fp16 en una única NVIDIA T4 de Kaggle durante 19,5 horas, alcanzando una pérdida final de 2,66 en entrenamiento y 2,82 en validación. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación y continuación de texto en inglés, hindi, bengalí, tamil y marathi.
- Manejo específico de texto code-mixed romanizado: hinglish, banglish, tanglish y marathi-inglés.
- Tokenización eficiente de texto romanizado gracias a un vocabulario BPE entrenado sobre ese dominio.
- Plantilla de chat y tokens especiales incluidos (`<|user|>...<|end|><|bot|>...<|end|>`), pensados para fine-tuning conversacional.
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso ni comportamiento de agente; es un modelo base sin alineación.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los cinco idiomas y variantes indicadas; el conocimiento general y el sentido común son débiles.

## Casos de uso

- Clasificación de texto code-mixed: fine-tuning con una cabeza de clasificación sobre la representación del modelo para detectar idioma, sentimiento o toxicidad en comentarios hinglish, banglish o tanglish, donde los tokenizadores ingleses fragmentan en exceso el texto.
- Normalización y transliteración: adaptación del modelo para convertir texto romanizado ruidoso (por ejemplo, comentarios de YouTube) a grafía nativa o a una forma estandarizada, aprovechando su familiaridad con las variantes de transliteración.
- Asistente conversacional de nicho: fine-tuning con LoRA sobre el kit `finetune/finetune_sarvi.py` para crear un bot de un tema concreto (soporte de un producto, FAQ) en hinglish o tanglish, con contexto suficiente para turnos cortos de 512 tokens.
- Generación de texto aumentada en dominios locales: continuación de reseñas, descripciones o publicaciones en redes adaptada a registros romanizados, útil para aumentar datasets de entrenamiento de modelos mayores.
- Investigación en lingüística computacional: base controlada y de tamaño pequeño para estudiar tokenización, perplejidad y transferencia en code-mixed indio sin el coste de modelos de miles de millones de parámetros.
- Prototipado educativo y experimentación: fine-tuning completo en una T4 gratuita de Colab o Kaggle (19,5 horas para el preentrenamiento completo), adecuado para cursos, pruebas de concepto y validación de pipelines antes de escalar a modelos mayores.
- Filtrado y moderación de comentarios: adaptación como clasificador de comentarios ofensivos o spam en tanglish, partiendo de un modelo que ya ha visto ese tipo de texto (DravidianCodeMix).

## Benchmarks y rendimiento

Evaluación en inglés zero-shot, con puntuaciones normalizadas por longitud (`acc_norm`), entre paréntesis la puntuación simple:

| Test | Preguntas | SARVI-166M-Base | Azar |
|---|---|---|---|
| ARC-Easy | 2.376 | 31,0% (30,5%) | 25,0% |
| HellaSwag | 10.042 | 27,2% (26,8%) | 25,0% |

Comparación en texto code-mixed frente a SmolLM2-135M, en bits por byte (menor es mejor), 150 documentos por idioma:

| Idioma | SARVI-166M-Base | SmolLM2-135M |
|---|---|---|
| Hinglish | 1,046 | 2,567 |
| Banglish | 1,152 | 2,975 |
| Tanglish | 1,031 | 2,867 |
| Marathi-English | 1,170 | 2,918 |
| English | 1,135 | 1,023 |

El propio autor advierte de que el conjunto de prueba procede de su split de validación (mismo dominio que el entrenamiento), de que SmolLM2 es principalmente un modelo inglés, de que la primera ronda usó un split distinto y algunos documentos de inglés, hinglish y banglish pudieron verse en entrenamiento, y de que buena parte del texto romanizado es Wikipedia transliterada automáticamente, no escritura real de usuarios.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,33 GB de pesos más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU con 2 GB o más.
- Fine-tuning completo en fp16: viable en una NVIDIA T4 (16 GB) o superior; el autor reporta 19,5 horas para el preentrenamiento completo en una T4 de Kaggle.
- Fine-tuning con LoRA: cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, e incluso en entornos gratuitos de Colab o Kaggle.
- GPU recomendadas: T4, L4, A10G, RTX 3090/4090, A100/H100 para entrenamiento a mayor escala o lotes grandes.
- Despliegue: compatible con transformers, text-generation-inference (TGI) y endpoints compatibles; el repo no incluye pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la inferencia es de milisegundos por token en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SARVI-166M-Base | 166M | 512 | en, hi, bn, ta, mr + code-mixed romanizado | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | no disponible en la información | Principalmente inglés | no disponible en la información | Hugging Face |
| Modelos multilingües indic de mayor tamaño | no disponible | no disponible | Indic | no disponible | no disponible |

Frente a SmolLM2-135M, SARVI es claramente superior en bits por byte sobre hinglish, banglish, tanglish y marathi-inglés (por ejemplo, 1,046 frente a 2,567 en hinglish) y ligeramente inferior en inglés (1,135 frente a 1,023). No se dispone de comparación con modelos multilingües indic de mayor tamaño; el autor indica explícitamente que no los ha evaluado.

## Limitaciones y advertencias

- Modelo base: continúa texto, no sigue instrucciones ni responde preguntas de forma fiable; requiere fine-tuning para uso conversacional.
- Ventana de contexto muy corta (512 tokens), insuficiente para documentos largos o conversaciones extensas.
- Conocimiento general y sentido común débiles: 31,0% en ARC-Easy y 27,2% en HellaSwag, apenas por encima del azar.
- El romanizado tamil y marathi proviene en su mayoría de Wikipedia transliterada automáticamente, por lo que la ortografía puede resultar libresca y poco natural.
- El hindi y el bengalí en grafía nativa solo se vieron en la primera ronda, por lo que su calidad es inferior.
- Riesgo de alucinación y de reproducir errores y sesgos del texto web de entrenamiento.
- Posible contaminación parcial: la primera ronda usó un split distinto, por lo que algunos documentos de test de inglés, hinglish y banglish pudieron verse en entrenamiento.
- Los resultados de code-mixed proceden del split de validación del propio autor, lo que favorece al modelo; no deben interpretarse como superioridad frente a modelos multilingües no evaluados.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (Sangraha y DravidianCodeMix) son CC BY 4.0, lo que exige atribución a AI4Bharat y a Chakravarthi et al.
- Sin datos publicados sobre cuantizaciones GGUF ni sobre latencia y throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnuvaNexus2026/SARVI-166M-Base
- Kit de fine-tuning: https://huggingface.co/AnuvaNexus2026/SARVI-166M-Base/tree/main/finetune
- Dataset Sangraha (AI4Bharat): https://huggingface.co/datasets/ai4bharat/sangraha
- Paper DravidianCodeMix (Chakravarthi et al.): https://arxiv.org/abs/2106.09460
- SmolLM2-135M (modelo de comparación): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
