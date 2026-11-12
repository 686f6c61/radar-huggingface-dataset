# davidxifeng/LFM3-1.7B-MLX-8bit-uzu

## Resumen

LFM3-1.7B-MLX-8bit-uzu es un reempaquetado del modelo LiquidAI/LFM3-1.7B-MLX-8bit para el motor de inferencia Uzu, desarrollado por Mirai (repositorio trymirai/uzu) y orientado a Apple Silicon mediante Metal. El autor del reempaquetado es davidxifeng. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de formato que traslada los tensores MLX de 8 bits afines (grupo 64) al layout de kernels que espera Uzu, sin recuantizar los pesos.

El modelo base pertenece a la familia LFM3 de LiquidAI, con 1.830.021.888 parámetros totales según los safetensors del repositorio, y está pensado para generación de texto. La relevancia de esta ficha es acotada: sirve para quien quiera ejecutar LFM3-1.7B en el motor Uzu sobre hardware Apple con Metal, aprovechando los kernels fusionados que implementa dicho motor.

La información pública disponible es muy limitada: cero descargas, cero likes, sin datos de idiomas declarados y sin benchmarks. La model card es puramente técnica y describe el proceso de conversión de tensores, no las capacidades del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM3 de LiquidAI; detalles de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 1.830.021.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine MLX (group size 64), sin recuantizacion en el reempaquetado |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (model.safetensors, ~1.8 GB); config.json, encoding.json, tokenizer.json |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí detalla la model card es el proceso de conversión: los tensores MLX affine 8-bit con grupo 64 se conservan tal cual, reinterpretando las palabras de código de U32 a U8 y transponiendo los planos de escala y sesgo de `[N, G]` a `[G, N]` para las capas lineales OutputInput, manteniéndolos en `[N, G]` para el embedding InputOutput. Las normas se convierten de BF16 a F32 y el kernel ShortConv también pasa de BF16 a F32.

La conversión incluye dos layouts específicos de kernel. La proyección fusionada `qkvg_projection` `[Q|K|V|GATE]` replica las filas de `gate_proj` por cabeza `head_dim` veces para adaptarse a la puerta por canal de Uzu, lo que según el autor es matemáticamente idéntico tras la desquantización. La MLP fusionada `up_projection` `[GATE|UP]` aplica SiLU sobre la mitad de puerta en el kernel de activación con puerta de Uzu. La presencia de ShortConv y de una proyección de puerta por cabeza sugiere componentes convolucionales y de atención con puerta propios de la familia LFM, aunque el repositorio no documenta la arquitectura completa.

## Capacidades

- Generación de texto autoregresiva (pipeline text-generation).
- Servido mediante API compatible con OpenAI: el ejemplo de la model card usa `/v1/chat/completions` con mensajes en formato rol/contenido.
- Ejecución en Apple Silicon a través de Metal, con kernels fusionados para proyección QKVG y MLP con puerta.
- Soporte de cuantización 8-bit MLX con grupo 64 para reducir el tamaño de pesos a ~1.8 GB.
- Tool calling, function calling, agentes, visión, audio, modo thinking y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo está empaquetado específicamente para Uzu sobre Metal, de modo que un desarrollador puede lanzar un servidor local con `cli server --model LFM3-1.7B-MLX-8bit-uzu --port 8000` y consumirlo por HTTP sin depender de la nube.
- Prototipado de aplicaciones de chat: la API expuesta imita el esquema de chat completions de OpenAI, lo que permite apuntar clientes existentes al endpoint local cambiando la URL base.
- Evaluación comparativa de motores de inferencia: al ser un reempaquetado exacto del modelo MLX 8-bit, sirve para medir el rendimiento de los kernels de Uzu frente a MLX nativo con los mismos pesos.
- Desarrollo de asistentes embebidos en aplicaciones de escritorio macOS: el tamaño de ~1.8 GB y la ejecución en Metal permiten integrar el modelo en apps locales con requisitos de memoria moderados.
- Pruebas de integración continua en runners macOS: un servidor local con este modelo permite ejecutar tests de pipelines de generación de texto sin claves de API externas.
- Investigación sobre formatos de pesos y kernels: la documentación de la conversión (reinterpretación U32→U8, transposición de planos de escala) es útil para quienes trabajan en toolchains de cuantización y layouts de tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan ~1.8 GB en 8-bit; el repositorio completo pesa 1.9 GB. La memoria total necesaria para inferencia (pesos más KV cache y buffers) no está documentada.
- GPU recomendadas: Apple Silicon con soporte Metal, dado que el motor Uzu y los kernels empaquetados son específicos de esa plataforma. No hay soporte indicado para A100, H100 ni RTX 4090.
- Cabe en hardware de consumo Apple: sí, por el tamaño de pesos; no se especifican modelos concretos de chip ni requisitos mínimos de memoria unificada.
- Opciones de despliegue: servidor CLI de Uzu (`cli server --model ... --port 8000`) con API compatible con OpenAI. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-8bit-uzu (este) | 1.830.021.888 | no disponible | safetensors 8-bit MLX para Uzu | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B-MLX-8bit (base) | no disponible en la informacion | no disponible | MLX 8-bit | lfm1.0 | Hugging Face |
| Otras alternativas de ~1.7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Reempaquetado, no modelo nuevo: las capacidades y limitaciones son las del modelo base LiquidAI/LFM3-1.7B-MLX-8bit; este repositorio solo cambia el layout de los tensores.
- Dependencia de plataforma: los kernels y el layout están diseñados para Uzu sobre Apple Silicon con Metal; no es portable a CUDA ni a otros motores sin reconversión.
- Sin datos de evaluación: no hay benchmarks, ni información de idiomas, ni de contexto, lo que impide validar calidad y comportamiento en producción.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben asumirse los del modelo base, no evaluados aquí.
- Licencia lfm1.0: es una licencia propia de LiquidAI con condiciones específicas; conviene revisar el archivo LICENSE antes de cualquier uso comercial.
- Madurez: cero descargas y cero likes, creado y actualizado el mismo día (12 de noviembre de 2026), sin señales de validación por parte de la comunidad.
- La fidelidad matemática de los layouts fusionados (repetición de filas de puerta, transposición de planos) la afirma el autor; no se aportan pruebas de equivalencia numérica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidxifeng/LFM3-1.7B-MLX-8bit-uzu
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-8bit
- Motor de inferencia Uzu (Mirai): https://github.com/trymirai/uzu
