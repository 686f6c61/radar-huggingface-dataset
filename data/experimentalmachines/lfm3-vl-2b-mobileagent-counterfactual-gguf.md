# experimentalmachines/LFM3-VL-2B-MobileAgent-Counterfactual-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Counterfactual-GGUF es una compilación en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-Counterfactual, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a actuar como agente de interfaz gráfica (GUI agent) sobre capturas de pantalla de dispositivos Android. Lo publica el usuario experimentalmachines como parte de un proyecto de investigación abierto (repositorio lfm3-mobile-agent) que documenta código, datos de entrenamiento, arneses de evaluación y resultados. El modelo base LFM3-VL-2B es un modelo vision-language de aproximadamente 1.730 millones de parámetros (1.728.801.600 según los pesos en safetensors) que combina una torre de visión con un modelo de lenguaje para tareas image-text-to-text.

La variante "Counterfactual" es una de las alternativas evaluadas dentro del proyecto: se documenta y se mide, pero el propio autor indica explícitamente que no la recomienda frente al modelo principal (LFM3-VL-2B-MobileAgent), que sigue siendo el modelo evaluado de referencia. Este repositorio GGUF contiene exactamente los ficheros empleados en la ejecución sobre AndroidWorld: un fichero de lenguaje cuantizado en Q4_K_M y un proyector de visión en Q8_0 sin modificar respecto al modelo base de LiquidAI.

Su relevancia es doble: por un lado, demuestra el flujo completo de conversión a GGUF y despliegue con llama.cpp de un agente móvil de 2B; por otro, publica métricas de éxito, falsos completados y proporción de pasos de espera sobre AndroidWorld, lo que permite comparar variantes de ajuste fino con transparencia. El modelo está pensado para investigación, no para uso desatendido en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (torre de visión + modelo de lenguaje); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en la configuración de servicio documentada (-c 8192); máximo arquitectónico no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y Q8_0 (proyector de visión, mmproj); el repo incluye solo estos ficheros |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (Q4_K_M + mmproj Q8_0); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del vision-language LFM3-VL-2B de LiquidAI, que empareja una torre de visión con un modelo de lenguaje de aproximadamente 1,7B parámetros para tareas de image-text-to-text. El ajuste fino "Counterfactual" se aplicó únicamente sobre el modelo de lenguaje: el proyector de visión (mmproj) es idéntico al de LiquidAI/LFM3-VL-2B-GGUF, según declara el autor. Esto implica que la adaptación al dominio móvil se realizó en la parte textual, que consume las representaciones visuales producidas por la torre congelada.

El entrenamiento se basó exclusivamente en demostraciones grabadas; el modelo nunca interactuó con un teléfono real durante el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La conversión a GGUF se realizó con llama.cpp en el commit cd959bae9, mediante convert_hf_to_gguf.py a F16 y posterior cuantización con llama-quantize a Q4_K_M. La innovación destacable no es arquitectónica sino metodológica: la publicación de variantes contrafactuales comparadas bajo el mismo arnés de evaluación y con los mismos ficheros que se usaron en las pruebas.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de una captura de pantalla y un objetivo en lenguaje natural.
- Predicción de acciones de interfaz gráfica sobre Android (toques, deslizamientos, entrada de texto, esperas), en el formato de prompt y salida documentado por el autor.
- Comprensión de imágenes: una captura de pantalla por paso, procesada por el proyector de visión.
- Razonamiento multi-paso con historial textual de hasta 24 pasos, incluyendo notas de "[no visible change]" para detectar acciones sin efecto.
- Formato de razonamiento compatible con el modo deepseek de llama-server (--reasoning-format deepseek).
- Capacidad conversacional (etiqueta conversational) y compatibilidad con endpoints.
- Soporte multilingüe limitado: solo inglés, tanto en objetivos como en instrucciones.
- No se documenta soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Investigación en agentes GUI móviles: sirve como punto de comparación reproducible frente al modelo principal y a la variante FullMix, usando el mismo arnés y los mismos ficheros GGUF que el autor empleó en AndroidWorld.
- Evaluación de estrategias de ajuste fino: al ser una variante contrafactual con métricas publicadas de éxito, falsos completados y proporción de esperas, permite estudiar el efecto de distintas mezclas de datos sobre el comportamiento del agente.
- Prototipado en hardware de consumo: con cuantización Q4_K_M y un modelo de 1,7B, se puede ejecutar en portátiles y equipos con GPU modesta mediante llama.cpp, lo que facilita iterar sobre prompts y formatos de salida sin infraestructura dedicada.
- Automatización de pruebas de aplicaciones Android: el modelo puede generar secuencias de acciones sobre capturas para pruebas exploratorias en entornos controlados (emuladores), siempre con supervisión humana.
- Docencia y demostraciones: ejemplos de agentes que leen pantallas y deciden acciones, con un modelo pequeño y un stack de código abierto (llama.cpp) fácil de explicar y replicar.
- Análisis de fallos en agentes: la métrica de falsos completados (24 de 116 tareas) y la baja proporción de pasos de espera (3,5%) lo hacen útil para estudiar el problema de declarar "done" antes de tiempo en tareas de varios pasos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre AndroidWorld (semilla de desarrollo 30, 116 tareas, exploratorio; arnés variante U con --history_steps 24 --nochange_notes --change_rule fine, sobre Apple M5):

| Metrica | Main | FullMix | Counterfactual |
|---|---|---|---|
| Éxitos | 18 | 21 | 19 |
| Falsos completados | 25 | 27 | 24 |
| Proporción de pasos de espera | 29,1% | 16,9% | 3,5% |

El propio autor señala que las diferencias en éxitos están dentro del ruido. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 1,3 GB; con el modelo de lenguaje en Q4_K_M y el proyector en Q8_0, la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM, y en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor ejecutó las evaluaciones en un Apple M5 (Apple Silicon, sin GPU dedicada).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas de gama media y alta recientes, y en equipos Apple Silicon.
- Opciones de despliegue: llama.cpp (llama-server), con los parámetros documentados: -c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99. Compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Counterfactual-GGUF (este) | ~1,73B | 8192 en servicio | Agente GUI móvil (variante no promovida) | LFM Open License v1.0 | GGUF en HF |
| LFM3-VL-2B-MobileAgent | ~1,73B (base) | no disponible | Agente GUI móvil, modelo principal recomendado | LFM Open License v1.0 | HF (GGUF y safetensors) |
| LFM3-VL-2B (LiquidAI) | ~1,73B | no disponible | Vision-language generalista | LFM Open License v1.0 | HF (incluye GGUF) |

Los tres comparten la misma base y licencia; la diferencia está en el ajuste fino y en el estado de promoción. No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe actuar de forma desatendida en un teléfono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en inglés y una captura de pantalla por paso; no tiene memoria más allá del historial textual de 24 pasos.
- Tiende a declarar "done" demasiado pronto en tareas de varios pasos: aproximadamente una quinta parte de los episodios de AndroidWorld registran falsos completados (24 de 116).
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento, lo que puede generar un desajuste con el estado real del dispositivo.
- Variante no promovida: el propio autor recomienda usar LFM3-VL-2B-MobileAgent en lugar de este modelo.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- Riesgo de alucinación en la interpretación de capturas y en la selección de acciones; requiere validación y supervisión humana.
- Sesgos: no se documentan sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Counterfactual-GGUF
- Modelo base (ajuste fino): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Counterfactual
- Modelo principal recomendado: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- GGUF del modelo principal: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-GGUF
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Guía de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
