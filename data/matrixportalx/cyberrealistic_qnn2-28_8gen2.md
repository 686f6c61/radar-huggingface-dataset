# matrixportalx/CyberRealistic_qnn2.28_8gen2

## Resumen

CyberRealistic_qnn2.28_8gen2 es una conversión del conocido checkpoint de Stable Diffusion 1.5 **CyberRealistic** a formato QNN (Qualcomm Neural Network), preparado para ejecutarse en la NPU de los procesadores Snapdragon a través de la aplicación Ruya / Local Dream. El modelo original, desarrollado por la comunidad de Civitai, es un fine-tune de SD 1.5 especializado en generación de imágenes fotorrealistas con un estilo versátil y limpio. Esta variante concreta ha sido adaptada por el usuario matrixportalx para ejecutarse en dispositivos móviles con Snapdragon, reduciendo el consumo de recursos y permitiendo la generación de imágenes 512×512 sin conexión a internet.

La relevancia de este modelo radica en la creciente demanda de inferencia de IA en el edge. Al convertir el UNet a un contexto binario QNN (ejecutado en la NPU) y mantener el text encoder y el VAE en MNN (CPU/GPU), se consigue un equilibrio entre velocidad y compatibilidad. La variante `min` (HTP v69, 16-bit activaciones) está diseñada para funcionar en una amplia gama de Snapdragon, desde la serie 7 Gen 1 hasta la 8 Gen 1 y superiores, lo que lo convierte en una opción práctica para desarrolladores que quieran integrar generación de imágenes en aplicaciones móviles sin infraestructura en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet en QNN, text encoder y VAE en MNN) |
| Parámetros totales | No disponible (no se especifica en la información proporcionada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generación de imágenes) |
| Tipos de cuantización | QNN: 16-bit activaciones, 8-bit pesos por canal; text encoder/VAE en MNN |
| Idiomas soportados | No disponible (el modelo base acepta prompts en inglés, pero no se documenta) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | QNN context binary (UNet), MNN (text encoder y VAE) |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion 1.5, un modelo de difusión latente que combina un text encoder (CLIP), un UNet como denoiser y un VAE para la decodificación de imágenes. La versión original de CyberRealistic fue creada mediante fine-tuning del checkpoint de SD1.5 con mezclas personalizadas y ajustes de estilo, orientada a producir resultados fotorealistas con buena nitidez y expresividad. Sin embargo, esta variante específica no es un reentrenamiento, sino una conversión del checkpoint original al formato QNN para su ejecución en NPU de Qualcomm.

El proceso de conversión, documentado en el repositorio `Sd-1.5-Converting-to-Qualcomm-QNN-Model`, transforma el UNet en un contexto binario QNN que se ejecuta en la NPU (HTP v69), mientras que el text encoder y el VAE se mantienen en MNN, que puede ejecutarse en CPU o GPU. Se aplica cuantización de 8 bits en los pesos y 16 bits en las activaciones, con un tamaño de VTCM (memoria de tensores) de 2 MB. No se han publicado detalles sobre el dataset de entrenamiento original ni el número de tokens procesados, ya que se trata de una adaptación de un checkpoint existente.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en resolución 512×512.
- Producción de imágenes fotorealistas con estilo versátil, capaz de generar retratos, paisajes y escenas variadas (según el modelo base).
- Ejecución completamente local en dispositivos Snapdragon, sin necesidad de conexión a internet.
- Compatibilidad con la aplicación Ruya / Local Dream mediante importación del modelo desde un archivo ZIP.
- No dispone de soporte para tool calling, agentes o razonamiento multi-paso; su única función es text-to-image.
- No se documentan capacidades multilingües específicas; el modelo base está entrenado principalmente con prompts en inglés.

## Casos de uso

- **Generación de imágenes en dispositivos móviles**: El modelo permite crear ilustraciones o fotografías sintéticas directamente en el teléfono, por ejemplo para aplicaciones de edición de fotos o generación de contenido creativo, gracias a su ejecución local en la NPU.
- **Prototipado rápido de aplicaciones de IA en el borde**: Los desarrolladores pueden integrar este modelo en apps Android para Snapdragon para ofrecer una función de generación de imágenes sin depender de la nube, reduciendo latencia y costes de servidor.
- **Personalización de contenido visual**: En aplicaciones de redes sociales o marketing, se puede usar para generar avatares, fondos o imágenes personalizadas en tiempo real, aprovechando el fotorealismo del modelo base.
- **Desarrollo de herramientas de asistencia creativa**: Artistas y diseñadores pueden emplear el modelo en entornos locales para explorar ideas visuales sin enviar datos a servidores externos, manteniendo la privacidad.
- **Pruebas y evaluación de conversión QNN**: Para investigadores interesados en la optimización de modelos de difusión en hardware móvil, este modelo sirve como caso de estudio de cuantización y despliegue en NPU.
- **Aplicaciones de accesibilidad**: Generación de descripciones visuales para personas con discapacidad visual, por ejemplo convirtiendo texto en imágenes ilustrativas en tiempo real, aunque requeriría integración adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas comparativas como FID, CLIP score o tiempos de inferencia para este modelo en concreto.

## Requisitos de hardware

- Requiere un dispositivo con procesador Snapdragon que incluya NPU con HTP v69 o superior (Snapdragon 7 Gen 1, 7s Gen 2, 8 Gen 1 y superiores).
- No aplica VRAM de GPU tradicional; el modelo está diseñado para ejecutarse en la NPU del móvil.
- La variante `min` (tier `min`) es la más compatible, con 16-bit activaciones y 8-bit pesos por canal, y un tamaño de VTCM de 2 MB.
- El repositorio contiene un archivo ZIP (1.0 GB) que se importa directamente en la aplicación Ruya / Local Dream mediante la opción "Import Custom Model".
- No se especifican opciones de despliegue en servidores (vLLM, llama.cpp, etc.) ya que es un modelo específico para móvil.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos similares en la información proporcionada. Existe otro modelo en HuggingFace con el mismo propósito, `Mr-J-369/CyberRealistic_Final-SD1.5-qnn2.28`, pero no se han publicado resultados comparativos de rendimiento ni calidad. La comparación se limitaría a la variante original de SD1.5 (CyberRealistic en Civitai) y otras conversiones QNN, pero sin datos objetivos no se puede realizar una tabla fiable.

## Limitaciones y advertencias

- El modelo puede generar contenido inapropiado o sensible, tal como se advierte en la página de Civitai del modelo original; el usuario es responsable del uso.
- La licencia CreativeML Open RAIL-M permite uso comercial pero impone restricciones sobre el uso para generar contenido dañino o ilegal.
- No se garantiza la calidad de las imágenes en todos los casos; el modelo base tiene limitaciones típicas de SD1.5, como distorsión en manos o artefactos en escenas complejas.
- La conversión QNN puede introducir pérdidas de calidad por la cuantización de 8 bits, aunque no se han publicado análisis de degradación.
- El modelo está limitado a la resolución de 512×512, por lo que no admite resoluciones superiores sin preprocesado o ampliación.
- No se documentan sesgos específicos, pero el modelo base puede reflejar sesgos presentes en el dataset de entrenamiento de SD1.5.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/matrixportalx/CyberRealistic_qnn2.28_8gen2)
- [Repositorio de conversión Sd-1.5-Converting-to-Qualcomm-QNN-Model](https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model)
- [Modelo original CyberRealistic en Civitai](https://civitai.com/models/15003/cyberrealistic)
- [Modelo similar Mr-J-369/CyberRealistic_Final-SD1.5-qnn2.28](https://huggingface.co/Mr-J-369/CyberRealistic_Final-SD1.5-qnn2.28)
