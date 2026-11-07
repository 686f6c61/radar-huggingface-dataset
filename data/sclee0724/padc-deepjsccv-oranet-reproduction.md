# sclee0724/PADC-DeepJSCCV-OraNet-Reproduction

## Resumen

PADC-DeepJSCCV-OraNet-Reproduction es una reproducción no oficial, en PyTorch y Google Colab, del trabajo "Predictive and Adaptive Deep Coding for Wireless Image Transmission in Semantic Communication" publicado en IEEE Transactions on Wireless Communications en 2023. El repositorio lo mantiene el usuario sclee0724 y contiene los checkpoints de los dos componentes del sistema: DeepJSCC-V, un codificador semántico conjunto fuente-canal para imágenes, y OraNet, una red predictiva que estima la calidad de reconstrucción (PSNR) para adaptar dinámicamente la tasa de codificación al estado del canal.

No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un par de redes neuronales orientadas a comunicaciones inalámbricas: transmiten imágenes comprimidas de forma semántica sobre canales con ruido (AWGN y fading) y predicen el rendimiento para seleccionar la configuración óptima. Los checkpoints disponibles cubren entrenamiento en CIFAR10 (variantes AWGN y fading) y ajuste fino en ImageNet, con evaluación sobre CIFAR100 y Kodak24.

El interés actual es acotado pero específico: sirve como referencia reproducible para investigadores en comunicaciones semánticas y redes neuronales aplicadas a la capa física, y como punto de partida para experimentar con codificación conjunta fuente-canal (JSCC) sin reimplementar el paper desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales convolucionales (DeepJSCC-V: autoencoder conjunto fuente-canal; OraNet: red predictiva de PSNR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión para transmisión de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.6 GB, presumiblemente checkpoints PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El sistema reproduce dos componentes del paper original. DeepJSCC-V es un autoencoder convolucional que codifica conjuntamente la imagen fuente y el canal: en lugar de la separación clásica entre compresión de fuente y codificación de canal, la red aprende una representación latente que se transmite directamente por el canal físico modelado (AWGN o fading), y el decodificador reconstruye la imagen a partir de la señal recibida, potencialmente degradada. OraNet es una red auxiliar que predice el PSNR de reconstrucción esperado para una configuración dada, lo que permite la adaptación predictiva de la tasa (el componente "predictive and adaptive" del título).

Los checkpoints publicados cubren cuatro configuraciones: DeepJSCC-V y OraNet entrenados en CIFAR10 con canal AWGN, las mismas dos redes con canal fading, DeepJSCC-V ajustado en ImageNet y OraNet entrenado en ImageNet. La model card indica que cada checkpoint de DeepJSCC-V debe emparejarse con el checkpoint de OraNet correspondiente al mismo canal y conjunto de datos. No se detallan en la información disponible el número de tokens, la composición exacta del dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal, que no corresponden a este tipo de arquitectura.

## Capacidades

- Codificación y transmisión semántica de imágenes sobre canales inalámbricos modelados (AWGN y fading).
- Reconstrucción de imágenes a partir de señales recibidas con ruido, con calidad medida en PSNR.
- Predicción del PSNR de reconstrucción mediante OraNet para una configuración de canal y tasa dadas.
- Adaptación predictiva de la tasa de codificación en función de las condiciones del canal.
- Evaluación sobre CIFAR100 y Kodak24 como conjuntos de validación.
- Ajuste fino sobre ImageNet para escenarios de imágenes naturales de mayor resolución.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en comunicaciones semánticas: reproducción de los resultados del paper IEEE TWC 2023 para validar o comparar variantes del codificador conjunto fuente-canal en condiciones AWGN y fading.
- Prototipado de JSCC en entornos académicos: uso de los checkpoints de CIFAR10 como línea base rápida para experimentos de codificación semántica sin reentrenar desde cero.
- Evaluación de robustez frente al ruido: análisis del PSNR de reconstrucción en canales con distintas relaciones señal-ruido usando los pares DeepJSCC-V/OraNet correspondientes.
- Estudio de adaptación de tasa: empleo de OraNet para predecir la calidad y seleccionar dinámicamente la configuración de codificación en simulaciones de enlace inalámbrico.
- Transferencia a imágenes naturales: uso del checkpoint ajustado en ImageNet y evaluación en Kodak24 para estudiar el comportamiento en imágenes de mayor resolución y contenido diverso.
- Docencia y formación: notebooks de Colab que permiten a estudiantes ejecutar el pipeline completo de entrenamiento y evaluación en un entorno reproducible.
- Comparación de arquitecturas: base para contrastar DeepJSCC-V con esquemas tradicionales de compresión más codificación de canal en términos de PSNR frente a SNR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repo (0.6 GB) sugiere que los checkpoints caben holgadamente en GPUs de consumo, aunque no se confirma la VRAM exacta.
- GPU recomendadas: no disponible; al tratarse de un modelo convolucional de visión de tamaño moderado, es probable que funcione en GPUs de consumo como RTX 3060 o superiores, pero no se especifica.
- Compatibilidad con GPU de consumo: probable por el tamaño del repo, sin confirmación oficial.
- Opciones de despliegue: PyTorch y Google Colab según el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| PADC-DeepJSCCV-OraNet-Reproduction (este) | JSCC + red predictiva | CIFAR10, ImageNet | no disponible | Hugging Face + GitHub |
| Implementación original (wyzhang-ustb) | JSCC + red predictiva | CIFAR10, ImageNet | no disponible | GitHub |
| DeepJSCC clásico (trabajos previos de JSCC) | Autoencoder conjunto fuente-canal | CIFAR10, etc. | no disponible | Repos académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Reproducción no oficial: los resultados pueden diferir de los del paper original; no hay validación publicada de equivalencia numérica.
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, lo que impide confirmar si el uso comercial está permitido. Se debe contactar con el autor antes de cualquier uso en producción.
- Dominio restringido: el modelo solo aborda transmisión de imágenes sobre canales simulados (AWGN y fading); no es aplicable a texto, audio ni otras modalidades.
- Dependencia de emparejamiento: cada checkpoint de DeepJSCC-V requiere el checkpoint de OraNet del mismo canal y dataset; un emparejamiento incorrecto invalida las predicciones.
- Evaluación limitada: los conjuntos de validación son CIFAR100 y Kodak24, de tamaño reducido; el comportamiento en imágenes fuera de distribución no está caracterizado.
- Sin benchmarks publicados: no hay métricas verificables en la información disponible más allá de la mención cualitativa al PSNR.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos de lenguaje, pero la reconstrucción de imágenes puede producir artefactos en condiciones de SNR muy baja.
- Uso en producción: no recomendado sin validación adicional, dado el carácter académico y no oficial de la reproducción.

## Enlaces

- Hugging Face: https://huggingface.co/sclee0724/PADC-DeepJSCCV-OraNet-Reproduction
- Repositorio GitHub de la reproducción: https://github.com/sclee0724/PADC-DeepJSCCV-OraNet
- Implementación original: https://github.com/wyzhang-ustb/Predictive-and-Adaptive-Deep-Coding-for-Wireless-Image-Transmission-in-Semantic-Communication
- Paper original (DOI): https://doi.org/10.1109/TWC.2023.3234408
