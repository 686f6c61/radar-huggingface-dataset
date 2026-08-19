# CaptchaKraken/CaptchaKraken-Lora-v1.2

## Resumen

CaptchaKraken-Lora-v1.2 es un adaptador LoRA multimodal para el modelo base Qwen/Qwen3.5-9B, desarrollado por el proyecto CaptchaKraken. Su propósito es resolver captchas de imagen de forma autónoma y autoalojada, integrándose en flujos de automatización de navegador. Es la primera versión del proyecto con soporte para retos animados (tipo "video") y la primera entrenada contra la generación 2 de prompts del sistema.

El modelo se sirve sobre el base Qwen3.5-9B, un modelo de visión y lenguaje de 9 mil millones de parámetros, y el adaptador se entrena exclusivamente con datos sintéticos generados por los propios generadores de puzzles de CaptchaKraken, excluyendo deliberadamente captchas reales del entrenamiento para usarlos como evaluación. El resultado es un sistema que localiza las celdas de un captcha mediante OpenCV y devuelve un plan de clics con coordenadas normalizadas en escala 0–1000. La licencia es de código disponible con restricciones comerciales específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=64, alpha=128, dropout 0.05) sobre Qwen3.5-9B (vision-lenguaje) |
| Parametros totales | no disponible (el adaptador pesa 0.8 GB; el base Qwen3.5-9B tiene 9B) |
| Parametros activos | no disponible (el adaptador no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | captchakraken-source-available-v1.1 |
| Formato de pesos | safetensors (peft) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.5-9B, un modelo multimodal de visión y lenguaje con arquitectura transformer. La LoRA se aplica tanto al modelo de lenguaje como a la torre visual, excluyendo el merger. El entrenamiento usa r=64, alpha=128, dropout 0.05, con una tasa de aprendizaje de 1e-4, batch de 1 con acumulación de gradiente de 8, durante 3 épocas. El dataset de entrenamiento contiene 58.500 entradas sintéticas (más 1.548 de validación) generadas por los propios generadores de puzzles de CaptchaKraken. Los captchas reales se excluyen del entrenamiento y se reservan para evaluación, lo que permite detectar cuándo un generador sintético deja de representar los puzzles reales.

El modelo responde a prompts de la "generación 2" del sistema CaptchaKraken, con un formato de coordenadas normalizado en escala 0–1000 (esquina superior izquierda (0,0), esquina inferior derecha (1000,1000)). Para puzzles animados, el prompt se envía como una secuencia de keyframes en una única petición multi-imagen, y el modelo responde nombrando el keyframe sobre el que actúa. El presupuesto de píxeles es crítico: se entrenó con MIN_PIXELS=200704 (448²) y MAX_PIXELS=518400 (720²), y Qwen recorta cada imagen a esa banda; servirlo con otra configuración degrada el rendimiento.

## Capacidades

- Resolución de captchas de imagen estáticos y animados ("video") mediante visión multimodal.
- Detección de la cuadrícula de tiles del captcha mediante OpenCV (parte del sistema CaptchaKraken, no del modelo en sí).
- Salida de coordenadas de clic normalizadas en escala 0–1000, con el keyframe correspondiente en puzzles animados.
- Integración con el cliente captchakraken (Python y npm) a partir de la versión 2.5.0, que gestiona automáticamente los prompts de generación 2.
- Funciona en flujos de automatización de navegador, incluyendo navegadores stealth o antidetect (uso propio permitido).
- No soporta tool calling ni razonamiento multi-step más allá de la tarea específica de captchas.
- No hay información disponible sobre capacidades multilingües.

## Casos de uso

- Automatización de navegadores para scraping: el modelo se integra en un pipeline de browser automation que detecta el captcha, lo resuelve y continúa la navegación, sin depender de servicios externos de terceros.
- Pipelines de recolección de datos a gran escala: en entornos donde se necesita mantener sesiones activas o acceder a páginas protegidas por captchas, el modelo permite completar el reto de forma local y con latencia controlada.
- QA y pruebas de accesibilidad: el modelo puede verificar que los flujos de captcha de una aplicación web funcionan correctamente, resolviendo los retos en entornos de prueba automatizados.
- Automatización de tareas administrativas propias: el usuario puede ejecutar el modelo en su propio hardware para completar captchas en sus propios flujos de trabajo (navegación, descarga, registro) sin vender el servicio.
- Pipelines de datos con integración en vLLM: el adaptador se sirve sobre vLLM, permitiendo su despliegue como servicio interno de baja latencia en infraestructura propia.
- Herramientas de accesibilidad para usuarios con discapacidad visual: el modelo puede integrarse en extensiones o utilidades que resuelven captchas automáticamente para facilitar el acceso a sitios web, siempre que el uso no se redistribuya como producto.

## Benchmarks y rendimiento

La evaluación del modelo se divide en tres niveles ("gates"), todos superados:

| Nivel | Métrica | Resultado |
|---|---|---|
| Gate 1 | Pruebas hermeticas pytest + paridad de prompt | pass |
| Gate 2 | Tasa de resolución graduada sobre captchas reales hold-out | pass — 0.6155 (baseline 0.5535, tolerancia 0) |
| Gate 3 | Conducción de fixtures HTML en vivo hasta completar, ambos puertos | pass |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible directamente, pero el modelo base Qwen3.5-9B en FP16 requiere aproximadamente 18–20 GB para inferencia; el adaptador LoRA añade un peso mínimo adicional.
- GPU recomendadas: para inferencia en FP16 se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, A100 40 GB). Con cuantización 8-bit (int8) o 4-bit (int4) cabe en GPUs de 12–16 GB (RTX 3080, RTX 4060 Ti 16 GB, L4).
- Se sirve en vLLM según la documentación del proyecto (PyPI).
- No hay información disponible sobre latencia o throughput en producción.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables en la misma categoría (solvers de captchas con LoRA sobre vision-language) en los datos proporcionados. Se recomienda comparar con soluciones comerciales o propietarias de resolución de captchas, aunque no se dispone de datos públicos de rendimiento para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial está permitido solo si el producto entrega valor más allá de la resolución de captchas. Se prohíbe vender, revender o alquilar un servicio de resolución de captchas como valor principal, distribuir wrappers con ese propósito, o integrarlo como característica de un navegador stealth o antidetect distribuido a terceros.
- Dependencia del cliente: requiere captchakraken >= 2.5.0. Los clientes anteriores a 2.5.0 envían prompts de generación 1, y el modelo no da error pero degrada silenciosamente el rendimiento en todos los puzzles.
- Sensibilidad al presupuesto de píxeles: entrenado con MIN_PIXELS=448² y MAX_PIXELS=720²; servirlo fuera de ese rango muestra al modelo puzzles a una escala que no aprendió a leer.
- No entrenado con datos reales: solo se entrenó con generadores sintéticos. Aunque la evaluación sobre captchas reales da un 0.6155, el rendimiento puede caer si los generadores sintéticos dejan de coincidir con los captchas reales.
- El modo de razonamiento (thinking) debe estar desactivado; si se activa, el parser enruta la respuesta a reasoning y deja content vacío.
- Sin datos disponibles sobre sesgos, alucinaciones o limitaciones lingüísticas específicas.

## Enlaces

- HuggingFace: https://huggingface.co/CaptchaKraken/CaptchaKraken-Lora-v1.2
- Modelo v1.1: https://huggingface.co/CaptchaKraken/CaptchaKraken_v1.1
- Repo GitHub: https://github.com/JWriter20/CaptchaKraken
- PyPI: https://pypi.org/project/captchakraken/
- README del puerto Python: https://github.com/JWriter20/CaptchaKraken/blob/main/python/README.md
- Licencia: https://huggingface.co/CaptchaKraken/CaptchaKraken-Lora-v1.2/blob/main/LICENSE
