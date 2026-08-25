# AETV/AETV

## Resumen

AETV (Autoencoder Television) es un códec de vídeo neuronal experimental y módem OFDM diseñado para transmitir vídeo analógico sobre canales HF de radioaficionado. El repositorio en HuggingFace contiene los checkpoints de inferencia para las dos modalidades principales del sistema: V7 y V8, que el software descarga automáticamente y verifica mediante SHA-256. No se trata de un modelo de generación de vídeo generalista, sino de un componente especializado dentro de una cadena de transmisión que combina codificación fuente-canal conjunta (joint source-channel coding) con modulación OFDM.

El proyecto surge del trabajo previo de Andrew Rodland en SSTVAE y de FreeDV RADE de David Rowe y Jean-Marc Valin, adoptando el enfoque de latente analógico sobre OFDM, codificación Golay y simulación de canal HF. La relevancia actual radica en su enfoque experimental para comunicaciones de vídeo de baja velocidad en bandas de radioaficionado, un área con escasa actividad de investigación reciente. Los checkpoints publicados son específicos para la geometría de modulación y modo de AETV, por lo que no son intercambiables con otros sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder neuronal con latente analógico sobre OFDM (códec de vídeo + módem) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (procesa vídeo por tramas, no texto) |
| Tipos de cuantizacion | no disponible (checkpoints en formato PyTorch nativo) |
| Idiomas soportados | no aplicable |
| Licencia | Artistic License 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

AETV combina un autoencoder de vídeo con un módem OFDM en un esquema de codificación fuente-canal conjunta. El vídeo se codifica en un espacio latente analógico que se modula directamente sobre subportadoras OFDM, evitando la separación tradicional entre compresión y corrección de errores. El sistema emplea codificación Golay para tramas y simulación de canal HF durante el entrenamiento, lo que permite al modelo aprender a ser robusto frente a desvanecimientos, ruido impulsivo y distorsiones propias de la propagación ionosférica.

El entrenamiento sigue un enfoque en dos etapas, heredado de FreeDV RADE. La primera etapa entrena el autoencoder con datos de vídeo genéricos; la segunda afina con objetivos perceptuales y GAN, como se observa en el checkpoint V8 (`v8-hf3k-face-gan.pt`), que incorpora recorte facial y ajuste fino con GAN para mejorar la calidad percibida en rostros. El checkpoint V7 (`v8-flex8k-ota-rxfix.pt`) es un modelo corregido para transmisión over-the-air con el modo Flex-8k. Los checkpoints `v7-flex8k-severe*.pt` son exportaciones solo-inferencia sin estado de optimizador ni discriminador.

## Capacidades

- Transmisión de vídeo de baja resolución sobre canales HF: 256×144 a 12 fps en modo V7, 192×108 a 6 fps en modo V8.
- Codificación fuente-canal conjunta: el modelo integra compresión y modulación, optimizando el rendimiento extremo a extremo.
- Robustez frente a condiciones de canal adversas: entrenado con simulación de canal HF, incluyendo desvanecimiento y ruido.
- Corrección de errores integrada mediante codificación Golay en el tramado.
- Recuperación de rostros: el modo V8 incluye ajuste fino con GAN y recorte facial para mejorar la fidelidad en videoconferencia de baja velocidad.
- Verificación de integridad: los checkpoints se descargan con verificación de SHA-256 y tamaño, garantizando reproducibilidad.

## Casos de uso

- Radioaficionado experimental: transmisión de vídeo de baja velocidad entre estaciones de HF sin infraestructura de internet, usando modos Flex-8k o HF-3k según el ancho de banda disponible.
- Demostraciones educativas de codificación fuente-canal: el sistema sirve como banco de pruebas para enseñar conceptos de joint source-channel coding en entornos universitarios o de laboratorio.
- Enlace de vídeo de emergencia: en situaciones donde las redes convencionales no están disponibles, AETV puede establecer un enlace de vídeo de muy baja tasa usando transceptores HF estándar.
- Investigación en códecs neuronales robustos: los checkpoints permiten reproducir experimentos y comparar estrategias de entrenamiento en dos etapas con GAN frente a otras aproximaciones.
- Evaluación de calidad de vídeo en canales degradados: el modelo puede usarse para estudiar cómo afectan distintos perfiles de canal HF a la calidad percibida, gracias a los modos de operación y los checkpoints de variantes.
- Integración en sistemas de telemetría visual: para aplicaciones de radioaficionado como balones meteorológicos o vehículos no tripulados que necesitan enviar vídeo de baja resolución a larga distancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas como PSNR, SSIM o tasas de error de bit para los distintos modos. La ausencia de datos comparativos impide evaluar cuantitativamente el rendimiento frente a otros códecs o sistemas de transmisión.

## Requisitos de hardware

- Los checkpoints son archivos PyTorch de aproximadamente 2.6 GB en total, pero el tamaño individual de cada checkpoint no se especifica en la información disponible.
- No se indican requisitos mínimos de VRAM ni GPU recomendadas. Dado que el procesamiento es de vídeo de baja resolución (máximo 256×144), es probable que una GPU de gama media (p. ej., RTX 3060 o superior) sea suficiente, pero no hay confirmación oficial.
- El despliegue requiere el software AETV del repositorio GitHub (plaingca/AETV), que gestiona la descarga de checkpoints y la inferencia. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del modo (V7 o V8) y del hardware, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (códecs neuronales de vídeo para HF). Los proyectos relacionados mencionados son SSTVAE y FreeDV RADE, pero no se ofrecen datos cuantitativos que permitan una comparación directa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los checkpoints son específicos para la geometría de modulación y modo de AETV; no son modelos de generación de vídeo generalistas y no pueden usarse fuera del contexto del sistema completo.
- El detalle generado puede ser plausible pero no exacto respecto a la fuente, especialmente en canales dañados y en rostros pequeños, según advierte el propio autor.
- La licencia Artistic 2.0 permite uso comercial y modificación, pero exige conservar avisos de copyright y atribución. Es recomendable revisar los términos completos antes de un uso comercial.
- No hay información sobre sesgos o riesgos de alucinación, al no ser un modelo de lenguaje. Sin embargo, la naturaleza generativa del códec implica que los detalles reconstruidos pueden ser inventados por el modelo.
- El proyecto es experimental: no hay garantías de estabilidad, soporte o mantenimiento a largo plazo.
- La fecha de creación del repositorio (agosto de 2026) sugiere que es un proyecto reciente y en fase de desarrollo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AETV/AETV
- Repositorio GitHub del proyecto: https://github.com/plaingca/AETV
- Proyecto SSTVAE (referencia): https://github.com/plaingca/SSTVAE (no confirmado, se menciona en el README)
- FreeDV RADE (referencia): https://github.com/drowe67/FreeDV (no confirmado, se menciona en el README)
