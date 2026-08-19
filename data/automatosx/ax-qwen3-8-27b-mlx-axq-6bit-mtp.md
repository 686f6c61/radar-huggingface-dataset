# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP es un checkpoint cuantizado en formato MLX (Apple Silicon) del modelo Qwen/Qwen3.8-27B, desarrollado por AutomatosX. Utiliza el esquema de cuantización mixta AXQuant (AXQ) para reducir el peso del modelo manteniendo una precisión media de 6 bits por peso (BPW). El modelo base es una arquitectura densa Qwen3_5ForConditionalGeneration con 27,36 mil millones de parámetros lógicos, que incluye un cabezal de predicción multi-token (MTP) y una torre de visión, ambos preservados en BF16 en sidecars opcionales.

Este checkpoint está pensado para ejecutarse en hardware Apple Silicon mediante MLX-LM o el motor AX Engine. Su relevancia radica en ofrecer una alternativa de alta precisión (6-bit) para despliegue local en Mac, con un tamaño de descarga de aproximadamente 20,9 GB. Es un paquete de desarrollo: la model card indica que no se han publicado métricas de calidad ni se certifica aceleración MTP, por lo que debe evaluarse antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa) con MTP y torre de vision |
| Parametros totales | 27.36B (logicos, modelo base); checkpoint cuantizado de 20.9 GB |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262,144 tokens (configurado; limites practicos segun memoria unificada) |
| Tipos de cuantizacion | AXQ mixed-precision: 4-bit (87.60%), 6-bit (0.05%), 8-bit (4.58%), BF16 (7.77%) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, una arquitectura transformer densa con 27,36 mil millones de parámetros, que incorpora un cabezal de predicción multi-token (MTP) y una torre de visión. Este checkpoint no es un entrenamiento nuevo, sino una conversión y cuantización del modelo original en BF16. La cuantización se realiza con AXQuant 1.6.2, que asigna diferentes precisiones por tensor: la mayoría de los pesos (87,60%) se cuantizan a 4-bit, mientras que los tensores protegidos (como los de la torre de visión y el cabezal MTP) se mantienen en BF16. El resultado es un peso medio medido de 6,0001 BPW incluyendo el sidecar MTP. No se ha realizado calibración; la asignación se basa en prioridades de arquitectura. El checkpoint se generó con MLX 0.32.0 y MLX-LM 0.31.3.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3.8-27B, hereda las capacidades de generacion de texto, razonamiento y comprension del lenguaje del modelo original.
- Vision: incluye una torre de vision en BF16 (sidecar `vision.safetensors`), lo que permite potencialmente tareas de vision-lenguaje, aunque la model card no garantiza su funcionamiento en MLX-LM estandar.
- Multi-token prediction (MTP): el checkpoint incluye un cabezal MTP en BF16 (sidecar `mtp.safetensors`), que podria acelerar la generacion, pero no esta certificado en este paquete.
- Ejecucion en Apple Silicon: optimizado para MLX, con soporte nativo en AX Engine.
- No incluye soporte de audio (no hay sidecar de audio).

## Casos de uso

- Despliegue local en Mac para generacion de texto: el modelo puede ejecutarse en un Mac con Apple Silicon usando MLX-LM, por ejemplo para asistentes de escritura o chatbots, aprovechando su contexto de 262K tokens para conversaciones largas.
- Prototipado de aplicaciones de vision-lenguaje: si se usa AX Engine, la torre de vision en BF16 permite experimentar con tareas de descripcion de imagenes o respuesta a preguntas visuales, aunque requiere verificacion de compatibilidad.
- Investigacion en cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de AXQ en modelos grandes, comparando calidad y velocidad frente a cuantizaciones uniformes.
- Generacion de codigo asistida: Qwen3.8-27B es conocido por su capacidad en codigo; este checkpoint puede usarse en entornos de desarrollo locales sin conexion a la nube.
- Analisis de documentos largos: con 262K tokens de contexto, es adecuado para resumir o extraer informacion de documentos extensos, siempre que la memoria unificada del Mac lo permita.
- Evaluacion de MTP en hardware Apple: aunque no certificado, el sidecar MTP permite probar si la prediccion multi-token mejora la latencia en tareas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay metricas de calidad frente a BF16 o baselines uniformes, y que no se certifica aceleracion MTP. Por tanto, no se puede comparar numericamente con otros modelos.

## Requisitos de hardware

- Dispositivo: Apple Silicon (M1, M2, M3, M4 o superior) con memoria unificada.
- Memoria: el checkpoint pesa 20.9 GB; se recomienda al menos 32 GB de RAM unificada para cargar el modelo y dejar margen para el contexto. Para 262K tokens, se necesitarian mas de 64 GB.
- GPU: no aplica GPU discreta; la ejecucion usa la GPU integrada y la memoria unificada del chip Apple.
- Opciones de despliegue: MLX-LM para inferencia de texto estandar; AX Engine para soporte nativo de MTP y vision.
- Latencia y throughput: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP (este) | 27.36B | 262K | AXQ 6-bit mixto | Apache-2.0 | MLX safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP (hermano) | 27.36B | 262K | AXQ 4-bit mixto | Apache-2.0 | MLX safetensors |
| Qwen/Qwen3.8-27B (original) | 27.36B | 262K | BF16 | Apache-2.0 | PyTorch / safetensors |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para comparar con otras familias de modelos.

## Limitaciones y advertencias

- Paquete de desarrollo: la model card lo clasifica como "development"; no se garantiza estabilidad ni soporte a largo plazo.
- Sin metricas de calidad: no se han publicado evaluaciones de retencion de calidad frente al modelo BF16 original; el rendimiento real puede variar.
- MTP no certificado: la aceleracion por multi-token prediction no esta verificada; el sidecar MTP puede no funcionar en MLX-LM estandar.
- Vision no garantizada: la torre de vision esta presente, pero su funcionamiento en MLX-LM no esta asegurado; requiere AX Engine y verificacion.
- Requisitos de memoria: el contexto de 262K tokens exige una cantidad muy alta de memoria unificada; en la practica, el contexto utilizable sera menor.
- Compatibilidad: requiere MLX-LM 0.31.3 o superior y, para funciones avanzadas, AX Engine 6.16.1; puede haber incompatibilidades con versiones futuras.
- Sesgos y alucinaciones: al ser una cuantizacion del modelo Qwen, hereda los sesgos y riesgos de alucinacion del modelo base, aunque no se han evaluado especificamente en esta version.

## Enlaces

- [HuggingFace - AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Catalogo de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
- [AX Engine (repositorio)](https://github.com/defai-digital/ax-engine)
- [Certificado Tier 1 del checkpoint](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq6-mtp-tier1.md)
