# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes-GGUF es una cuantización en formato GGUF del modelo experimental LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes, publicado por experimentalmachines. Se trata de un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la actuación como agente de interfaz gráfica (GUI agent) sobre capturas de pantalla de teléfonos Android. El modelo recibe un objetivo en inglés y una captura por paso, y produce la siguiente acción a ejecutar sobre la pantalla.

El modelo base parte de la familia LFM3-VL-2B de Liquid AI, con aproximadamente 1.728 millones de parámetros en los pesos safetensors y una torre de visión que, según la model card, no fue modificada durante el ajuste fino. El repositorio GGUF ocupa 1,3 GB e incluye dos ficheros: el modelo de lenguaje cuantizado en Q4_K_M y el proyector de visión en Q8_0.

Es importante señalar que el propio autor lo marca explícitamente como modelo de desarrollo, conservado únicamente para reproducir resultados y no recomendado para uso general. Falló su puerta de validación offline (precisión de paso en AndroidControl de 0,545) y nunca se ejecutó en AndroidWorld ni en un teléfono real. Para uso práctico, el autor remite a LFM3-VL-2B-MobileAgent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión con proyector), base LFM3-VL-2B |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración de servicio indicada en la model card) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y Q8_0 (proyector de visión) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (derivado de safetensors bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo multimodal LFM3-VL-2B de Liquid AI. La arquitectura combina un modelo de lenguaje con una torre de visión y un proyector multimodal; el ajuste fino no modificó la torre de visión, por lo que el proyector Q8_0 del repositorio es idéntico al de LiquidAI/LFM3-VL-2B-GGUF. El proceso de cuantización se realizó con llama.cpp (commit cd959bae9): conversión de los pesos publicados a F16 mediante convert_hf_to_gguf.py y posterior cuantización a Q4_K_M con llama-quantize.

El entrenamiento del modelo base de este ajuste consistió en demostraciones grabadas de interacción con pantallas Android, con objetivos en inglés y una captura por paso. El nombre del modelo (DPOAllMistakes) sugiere una fase de optimización por preferencias directas (DPO) sobre el conjunto de errores, aunque la información disponible no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni los hiperparámetros. El modelo nunca interactuó con un teléfono real durante el entrenamiento.

## Capacidades

- Generación de acciones de agente GUI a partir de una captura de pantalla y un objetivo en lenguaje natural.
- Comprensión de imágenes (image-text-to-text) limitada a capturas de pantalla de interfaz móvil.
- Razonamiento de un solo paso: recibe una captura y emite la siguiente acción, sin planificación multi-paso autónoma verificada.
- Formato de razonamiento compatible con deepseek (--reasoning-format deepseek en llama-server).
- Conversación multi-turno en el sentido de mantener el formato de prompt conversacional.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no, solo inglés.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Reproducción de experimentos de investigación: el modelo se conserva para replicar los resultados del proyecto lfm3-mobile-agent, comparando el comportamiento del ajuste fino con errores frente a la versión principal.
- Evaluación de pipelines de agentes GUI en laboratorio: permite medir la precisión de paso sobre AndroidControl (0,545 en este modelo) y contrastarla con otras variantes del mismo proyecto.
- Pruebas de cuantización multimodal: sirve para validar el flujo de conversión a GGUF y el despliegue con llama.cpp de modelos visión-lenguaje de 2B parámetros en hardware modesto.
- Desarrollo de arneses de benchmark offline: al estar en GGUF, se integra fácilmente en scripts de evaluación reproducibles sobre capturas estáticas de Android.
- Estudio de degradación por DPO: al ser una variante entrenada sobre todos los errores, permite analizar cómo afecta ese proceso al rendimiento final frente al modelo base.
- Prototipado de asistentes móviles en entornos controlados: únicamente con fines de investigación y sin acceso a cuentas, mensajes o pagos reales, tal como advierte el autor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| AndroidControl (precisión de paso) | 0,545 | Falló la puerta offline; cifra obtenida con los pesos bf16, no con el GGUF |
| AndroidWorld | no ejecutado | El autor indica que nunca se ejecutó |
| Prueba en teléfono real | no ejecutada | El autor indica que nunca se ejecutó |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 1,3 GB; con Q4_K_M del modelo de lenguaje y Q8_0 del proyector, la huella en memoria es de aproximadamente 1,5-2 GB, más el espacio para el contexto (8.192 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor no especifica modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: sí, cabe en GPU de consumo modernas (por ejemplo, RTX 3060 en adelante) e incluso en hardware móvil con llama.cpp.
- Opciones de despliegue: llama.cpp mediante llama-server, con los parámetros indicados en la model card (-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes-GGUF | 1.728.801.600 | 8.192 tokens | GGUF | LFM Open License v1.0 | Modelo de desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent (versión principal) | no disponible | no disponible | no disponible | LFM Open License v1.0 | Recomendado por el autor |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | safetensors / GGUF | LFM Open License v1.0 | Modelo base multimodal |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de desarrollo: el autor lo marca como no recomendado y lo conserva solo para reproducir resultados.
- Falló la puerta de validación offline con una precisión de paso de 0,545 en AndroidControl.
- Nunca se ha ejecutado en AndroidWorld ni en un teléfono real.
- Solo admite objetivos en inglés y una captura por paso.
- Entrenado exclusivamente con demostraciones grabadas; no ha interactuado con un teléfono en vivo.
- Riesgo de alucinación y de acciones incorrectas en interfaces reales no evaluado.
- No debe usarse de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- Licencia LFM Open License v1.0: conviene revisar las condiciones para uso comercial antes de desplegarlo en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes-GGUF
- Modelo base (bf16): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes
- Versión principal recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guía de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentación de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
