# ramithuh/thermompnn-webgpu

## Resumen

ThermoMPNN WebGPU es una redistribución de los pesos del modelo ThermoMPNN, desarrollado originalmente por Kuhlman Lab, empaquetados en formato safetensors para su ejecución nativa en navegador mediante WebGPU. El modelo resuelve la predicción de cambios de estabilidad en proteínas ante mutaciones de un solo punto, generando una matriz completa de tamaño L × 20 (una predicción de ΔΔG por cada posición de la secuencia y cada uno de los 20 aminoácidos estándar). Es relevante porque traslada una herramienta de diseño de proteínas basada en aprendizaje profundo a un entorno puramente cliente, sin necesidad de servidor ni backend de inferencia.

El repositorio lo publica el usuario ramithuh y no entrena un modelo nuevo: redistribuye los pesos upstream de ThermoMPNN (`thermoMPNN_default.pt`) en tres precisiones (INT8, FP16 y FP32) fragmentadas en shards de como máximo 25 MB para facilitar su carga en navegador. La verificación se realizó sobre una GPU NVIDIA GB10 con WebGPU sobre Chromium/Vulkan, comparando trazas intermedias contra PyTorch, con un error relativo RMS máximo de 2.04e-6 en el peor de los 36 escenarios probados.

El interés práctico está en el despliegue edge: cualquier aplicación web puede ejecutar la predicción de estabilidad de mutaciones sin infraestructura GPU dedicada. No obstante, se trata de un artefacto de pesos, no de un modelo de lenguaje, y su utilidad está acotada al dominio concreto de la ingeniería de proteínas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de predicción de ΔΔG de ThermoMPNN; red neuronal sobre representaciones de proteína, detalles no incluidos en la información) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de proteínas, no de texto) |
| Tipos de cuantizacion | INT8 simétrica por fila con escalas F32 colocadas; FP16 con normas y sesgos en FP32; FP32 de referencia |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (shards de ≤ 25 MB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original ThermoMPNN más allá de su propósito: predecir cambios de estabilidad (ΔΔG) para mutaciones de un solo punto en proteínas, produciendo una salida L × 20. El modelo upstream procede de Kuhlman Lab y se cita en Dieckhaus et al., *PNAS* (2024). Los datos de entrenamiento (número de tokens o estructuras, composición del dataset, uso de RLHF o ajuste fino) no están incluidos en la información proporcionada.

La innovación de esta redistribución es el empaquetado para WebGPU: pesos en safetensors con cuantización INT8 simétrica por fila (escalas F32 colocadas junto a los pesos) y FP16 con normas y sesgos preservados en FP32, todo fragmentado en shards de hasta 25 MB para carga incremental en navegador. La validación se hizo contra trazas intermedias de PyTorch en 9 modos de entrada y 36 combinaciones, con un error relativo RMS máximo de 2.04e-6 en la traza GPU.

## Capacidades

- Predicción de cambios de estabilidad (ΔΔG) para mutaciones de un solo punto en proteínas.
- Generación de la matriz completa L × 20 de predicciones por posición y aminoácido.
- Ejecución nativa en navegador mediante WebGPU, sin backend de inferencia.
- Tres niveles de precisión intercambiables (INT8, FP16, FP32) para equilibrar tamaño y fidelidad numérica.
- Carga fragmentada por shards de ≤ 25 MB, adecuada para entornos web con restricciones de memoria.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Diseño de proteínas en el navegador: un investigador puede cargar una secuencia y obtener el mapa L × 20 de ΔΔG directamente en una aplicación web, sin instalar CUDA ni dependencias de PyTorch.
- Herramientas educativas interactivas: visualizar el efecto de mutaciones sobre la estabilidad proteica en tiempo real dentro de un cuaderno o demo web, aprovechando la ejecución cliente.
- Filtrado previo de mutaciones en pipelines de ingeniería de proteínas: usar la variante INT8 (~1.9 MB) para descartar rápidamente candidatos inestables antes de simulaciones más costosas.
- Prototipado de aplicaciones bioinformáticas sin servidor: el despliegue íntegro en WebGPU elimina la necesidad de mantener infraestructura GPU para demos o herramientas internas.
- Integración en plataformas de laboratorio con privacidad de datos: al ejecutarse en el cliente, las secuencias no salen del navegador del usuario, lo que facilita el cumplimiento en entornos con datos sensibles.
- Validación numérica reproducible: la variante FP32 (~7.4 MB) sirve como referencia para comparar implementaciones WebGPU contra PyTorch en pruebas de regresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento numérico es la verificación de fidelidad: error relativo RMS máximo de 2.04e-6 en la peor de 36 combinaciones (9 modos de entrada) comparando trazas GPU WebGPU contra PyTorch sobre NVIDIA GB10 con Chromium/Vulkan.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; los pesos ocupan aproximadamente 1.9 MB (INT8), 3.7 MB (FP16) y 7.4 MB (FP32), por lo que la huella de memoria es muy reducida.
- GPU recomendadas: cualquier GPU con soporte WebGPU; la verificación se realizó sobre NVIDIA GB10.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU integrada o dedicada con WebGPU habilitado, dado el tamaño de los pesos.
- Opciones de despliegue: navegador con WebGPU (Chromium/Vulkan verificado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de predicción de ΔΔG ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Es un artefacto de pesos redistribuidos, no un modelo entrenado por el publicador; la calidad depende del modelo upstream de Kuhlman Lab.
- Solo predice mutaciones de un solo punto; no cubre mutaciones múltiples ni efectos epistáticos.
- El dominio es exclusivamente proteico: no procesa texto, imágenes ni audio.
- La cuantización INT8 introduce desviaciones numéricas respecto a FP32; para aplicaciones sensibles conviene usar FP16 o FP32.
- La verificación se limita a una GPU (NVIDIA GB10) y a Chromium/Vulkan; el comportamiento en otros navegadores o backends WebGPU no está documentado.
- El repositorio registra 0 descargas y 0 likes, sin pipeline definido ni idiomas declarados; la madurez y el soporte comunitario son mínimos.
- Licencia MIT: permite uso comercial, pero debe mantenerse la atribución a Kuhlman Lab y citarse Dieckhaus et al., *PNAS* (2024).
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo real es la extrapolación a proteínas fuera de la distribución de entrenamiento del modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/thermompnn-webgpu
- Repositorio upstream: https://github.com/Kuhlman-Lab/ThermoMPNN
- Publicación citada: Dieckhaus et al., *PNAS* (2024) — referencia sin enlace directo en la información disponible.
