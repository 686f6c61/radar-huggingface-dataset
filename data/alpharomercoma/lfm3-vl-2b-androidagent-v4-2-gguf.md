# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF

## Resumen

LFM3-VL-2B-AndroidAgent-v4.2-GGUF es una compilación en formato GGUF de un ajuste fino del modelo multimodal LFM3-VL-2B de Liquid AI, orientado a la automatización de interfaces gráficas en Android. El modelo base intermedio es `experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory`, un fine-tune del LFM3-VL-2B original entrenado sobre demostraciones grabadas de interacción con pantallas de teléfono. Esta variante concreta, publicada por el usuario alpharomercoma, es un build de desarrollo conservado únicamente para reproducir los resultados de las evaluaciones del proyecto; el propio autor del modelo base recomienda no usarlo y emplear en su lugar la versión estable `LFM3-VL-2B-MobileAgent`.

El modelo resuelve el problema de convertir capturas de pantalla de Android en acciones concretas (toques, deslizamientos, entradas de texto) dentro de un bucle de agente de hasta ocho pasos. Combina una torre de visión con un modelo de lenguaje de aproximadamente 1.730 millones de parámetros y una ventana de contexto de servicio de 8.192 tokens, con un máximo de 1.024 tokens por imagen. La relevancia actual reside en su tamaño reducido, que permite ejecutarlo en hardware modesto mediante llama.cpp, y en su enfoque específico para agentes móviles, un nicho con pocas alternativas abiertas.

La licencia es la LFM Open License v1.0, heredada de LiquidAI/LFM3-VL-2B, y el modelo solo declara soporte para inglés. Su estado es explícitamente de investigación: no debe operar de forma desatendida sobre dispositivos con cuentas reales, mensajes o pagos. El repositorio ocupa 1,3 GB e incluye dos ficheros: el modelo de lenguaje cuantizado en Q4_K_M y el proyector de visión en Q8_0, este último sin modificar respecto al original de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + modelo de lenguaje), base LFM3-VL-2B |
| Parametros totales | 1.728.801.600 (dato de safetensors del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuracion de servicio documentada) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje), Q8_0 (proyector de visión) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF (generado con llama.cpp `cd959bae9`, F16 → Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM3-VL-2B de Liquid AI, un modelo multimodal de tipo transformer que combina un codificador visual con un modelo de lenguaje de 2B parámetros. El fine-tune se realizó sobre demostraciones grabadas de interacción con pantallas de Android (historial propio del agente, según el nombre del modelo base), es decir, pares de captura de pantalla y acción esperada. La torre de visión no fue modificada durante el ajuste: el proyector `mmproj-LFM3-VL-2B-Q8_0.gguf` es idéntico al publicado por LiquidAI/LFM3-VL-2B-GGUF. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es el formato de interacción: el agente recibe una captura por paso y mantiene una memoria textual de hasta ocho pasos, sin memoria visual más allá de la captura actual. El proceso de conversión a GGUF está documentado y es reproducible byte a byte mediante `convert_hf_to_gguf.py` seguido de `llama-quantize Q4_K_M`. El servicio se realiza con `llama-server` y el flag `--reasoning-format deepseek`, lo que sugiere un formato de razonamiento estructurado en la salida del modelo.

## Capacidades

- Comprensión de capturas de pantalla de Android y generación de acciones de interfaz (toques, deslizamientos, texto).
- Razonamiento de agente multi-paso limitado a ocho pasos de historial textual.
- Generación de texto conversacional en inglés.
- Procesamiento de imagen-texto a texto (pipeline `image-text-to-text`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés.
- Modo de razonamiento estructurado (`--reasoning-format deepseek` en llama-server).
- Capacidades de audio: no disponibles.

## Casos de uso

- Automatización de pruebas de interfaz en Android: el modelo puede interpretar capturas de pantalla de una app y generar la secuencia de toques para recorrer flujos de UI, útil en pipelines de QA donde se necesita un agente que entienda la pantalla sin selectores frágiles.
- Investigación en agentes GUI: sirve como punto de partida reproducible para experimentos de control de interfaces móviles, ya que el proyecto documenta datos, harness de evaluación y resultados con su fuente.
- Reproducción de benchmarks de agentes móviles: al ser el build exacto sobre el que se ejecutaron las evaluaciones del proyecto, permite verificar resultados de forma independiente en llama.cpp.
- Prototipado de asistentes de accesibilidad: un agente que describe y opera pantallas podría asistir a usuarios con dificultades motoras, siempre en entorno controlado y con supervisión.
- Extracción de información de pantallas: dado un screenshot, el modelo puede transcribir y estructurar el contenido visible para tareas de scraping visual o auditoría de apps.
- Despliegue en hardware de gama baja: con cuantización Q4_K_M y 1,7B parámetros, es viable en dispositivos con poca VRAM o incluso CPU, lo que facilita entornos de laboratorio y demostraciones.
- Formación y docencia: ejemplo didáctico de fine-tune multimodal y conversión a GGUF con procedimiento documentado y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M del modelo de lenguaje más el proyector Q8_0 suman aproximadamente 1,3 GB en disco; la VRAM necesaria para inferencia ronda los 2-3 GB con contexto de 8.192 tokens, aunque no se dispone de una medición oficial.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); en GPUs profesionales A100 o H100 el modelo queda infrautilizado pero funciona.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más; también es viable en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), con los flags documentados `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`. Compatibilidad con vLLM, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.2-GGUF (este) | 1,73B | 8.192 | en | lfm1.0 | Desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent (estable) | no disponible | no disponible | en | lfm1.0 | Recomendado por el autor |
| LiquidAI/LFM3-VL-2B (base) | ~2B (por nombre) | no disponible | no disponible | lfm1.0 | Modelo base multimodal |

La comparativa con alternativas de otros fabricantes (por ejemplo, agentes GUI basados en modelos de mayor tamaño) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de no dejarlo actuar de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- Estado de desarrollo: conservado solo para reproducir resultados; se recomienda usar `LFM3-VL-2B-MobileAgent` en su lugar.
- Solo acepta objetivos en inglés y una captura de pantalla por paso.
- Memoria limitada a ocho pasos de historial textual, sin memoria visual más allá de la captura actual.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento, lo que puede provocar un rendimiento deficiente ante estados de UI no vistos.
- Riesgo de alucinación en la interpretación de pantallas y en la selección de acciones.
- Sesgos: no disponibles en la información proporcionada.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.

## Enlaces

- [Hugging Face: alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF](https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF)
- [Modelo base: experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory)
- [Versión estable: experimentalmachines/LFM3-VL-2B-MobileAgent](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent)
- [Modelo original: LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B)
- [GGUF original: LiquidAI/LFM3-VL-2B-GGUF](https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF)
- [Repositorio del proyecto: experimentalmachines/lfm3-mobile-agent](https://github.com/experimentalmachines/lfm3-mobile-agent)
- [Guía de nombres](https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md)
- [Documentación de modelos](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md)
- [Resultados](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md)
