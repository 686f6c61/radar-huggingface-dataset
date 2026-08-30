# nightmedia/Wichtelchen-Qwen3.5-9B-mxfp8-mlx

## Resumen

Wichtelchen-Qwen3.5-9B-mxfp8-mlx es una conversión al formato MLX (Apple Silicon) del modelo base schneewolflabs/Wichtelchen-Qwen3.5-9B, desarrollado por el usuario nightmedia. Se trata de un modelo multimodal (imagen-texto a texto) basado en la arquitectura Qwen3.5, con un ajuste fino adicional mediante DPO y SFT sobre datasets específicos orientados a agentes, tool-use y código. El modelo está cuantizado en mxfp8, lo que reduce su huella de memoria manteniendo una calidad aceptable, y está pensado para ejecutarse eficientemente en hardware Apple con el framework MLX.

Aunque el nombre sugiere 9B de parámetros, los pesos reales en safetensors suman 2.975.030.512 parámetros (~3B), probablemente debido a la cuantización o a una poda del modelo base. La ventana de contexto nativa es de 262.144 tokens, según la documentación de Qwen3.5. Su licencia Apache-2.0 permite uso comercial sin restricciones, y el pipeline declarado es image-text-to-text, lo que indica capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5) |
| Parametros totales | 2.975.030.512 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | mxfp8 (8-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El modelo es una adaptacion de Qwen3.5, un transformer denso multimodal que procesa tanto texto como imagenes. La arquitectura interna no se detalla en la informacion disponible, pero se infiere que mantiene el diseño estandar de Qwen3.5 con atencion completa y capas de vision. El entrenamiento base corresponde al modelo original, y sobre el se aplicaron ajustes adicionales mediante DPO (Direct Preference Optimization) y SFT (Supervised Fine-Tuning) con los datasets: nbeerbower/GreatFirewall-DPO, schneewolflabs/egirl-DPO, schneewolflabs/egirl-delegation-dpo, schneewolflabs/egirl-hemlock-dpo y hemlang/Hemlock-SFT-combined. Estos datasets estan orientados a mejorar el comportamiento en tareas de agentes, tool-use y codigo, asi como a alinear el modelo con preferencias humanas. No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento y respuesta a preguntas de conocimiento general (benchmarks como boolq, piqa, winogrande).
- Comprension lectora y sentido comun (hswag, obkqa).
- Soporte de tool calling y function calling, habilitado por los datasets de entrenamiento orientados a agentes.
- Capacidad multimodal: procesa entradas de imagen y texto (pipeline image-text-to-text).
- Generacion de codigo, gracias al entrenamiento con datasets de codigo y tool-use.
- Capacidad de agentes y razonamiento multi-paso, reforzada por los datasets de delegacion y hemlock.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y responder consultas de usuarios en ingles, integrandose en sistemas de soporte via API.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar codigo, ejecutandose localmente en equipos Apple.
- Agentes autonomos: gracias a su entrenamiento en delegacion y tool-use, puede actuar como agente que decide que herramientas invocar para completar tareas complejas, como busquedas web o ejecucion de scripts.
- Analisis de imagenes con texto: al ser multimodal, puede describir imagenes, extraer informacion de capturas o generar alt-text, util en aplicaciones de accesibilidad o moderacion de contenido.
- Asistente de programacion local: desplegado con MLX en un Mac, ofrece respuestas de baja latencia (527 tokens/seg) para desarrolladores que necesitan ayuda sin depender de la nube.
- Investigacion academica: su licencia Apache-2.0 y su formato MLX permiten experimentar con tecnicas de cuantizacion y fine-tuning en entornos Apple, sirviendo como base para estudios de eficiencia.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks en tareas de razonamiento y comprension, junto con metricas de cuantizacion. Se presentan a continuacion:

| Tarea | Resultado (mxfp8) |
|---|---|
| ARC (challenge) | 0.669 |
| ARC (easy) | 0.849 |
| BoolQ | 0.903 |
| HellaSwag | 0.760 |
| OpenBookQA | 0.492 |
| PIQA | 0.800 |
| Winogrande | 0.707 |

Metricas de cuantizacion:

| Metrica | Valor |
|---|---|
| Perplexity | 4.453 ± 0.030 |
| Pico de memoria | 16.02 GB |
| Tokens por segundo | 527 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: 16.02 GB de memoria unificada (pico medido en Apple Silicon).
- GPU recomendadas: Apple Silicon (M1 Pro o superior, M2/M3/M4) con al menos 16 GB de RAM unificada. No apto para GPUs NVIDIA de consumo sin adaptacion.
- En consumer GPU: no disponible, ya que el formato MLX esta optimizado para Apple Silicon.
- Opciones de despliegue: MLX (mlx-lm), compatible con LM Studio y otras herramientas que soporten MLX. Tambien puede convertirse a otros formatos (GGUF, etc.) si se desea usar en llama.cpp u Ollama, aunque no se proporciona esa conversion.
- Latencia y throughput: 527 tokens/seg en el hardware de prueba, con pico de memoria de 16.02 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wichtelchen-Qwen3.5-9B-mxfp8-mlx | ~3B (cuantizado) | 262K | Apache-2.0 | MLX | Conversion MLX, multimodal, tool-use |
| Qwen3.5-9B (original) | 9B | 262K | Apache-2.0 | safetensors | Modelo base, no cuantizado, disponible en multiples formatos |
| Otros modelos 9B (ej. Llama 3.1 8B) | 8B | 128K | Llama 3.1 | safetensors, GGUF | No multimodal, sin tool-use nativo |

La comparativa se basa en datos publicos de Qwen3.5 y modelos similares; no se dispone de benchmarks comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma limitado: solo soporta ingles, lo que restringe su uso en entornos multilingues.
- Sesgos potenciales: al entrenarse con datasets especificos (egirl, hemlock), puede presentar sesgos de estilo o contenido no deseado en produccion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- Dependencia de Apple Silicon: el formato MLX limita su despliegue a hardware Apple; para otros entornos se requiere conversion a otros formatos.
- Parametros efectivos reducidos: aunque el nombre indica 9B, los pesos reales son ~3B, lo que puede afectar a la capacidad de razonamiento en comparacion con el modelo original.
- Sin garantias de rendimiento en tareas de vision: aunque el pipeline es image-text-to-text, no se proporcionan benchmarks especificos de vision.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datasets de entrenamiento pueden tener sus propias licencias; se recomienda revisar cada uno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Wichtelchen-Qwen3.5-9B-mxfp8-mlx
- Modelo base: https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwen3.5 en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Articulo sobre despliegue en Apple Silicon: https://dev.to/thefalkonguy/installing-qwen-35-on-apple-silicon-using-mlx-for-2x-performance-37ma
