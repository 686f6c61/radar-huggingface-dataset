# bbalqq/sam2-onnx

## Resumen

El modelo `bbalqq/sam2-onnx` es una conversión a formato ONNX del modelo de segmentación SAM 2.1 en su variante Hiera Large, desarrollado originalmente por Meta AI. El autor `bbalqq` ha publicado este repositorio en Hugging Face con licencia MIT, con el objetivo de ofrecer el modelo en un formato optimizado para su ejecución con ONNX Runtime, lo que facilita su despliegue en entornos sin dependencias de PyTorch o en dispositivos de menor capacidad. Se trata de un modelo de visión que resuelve tareas de segmentación semántica e interactiva sobre imágenes y vídeo, y es especialmente relevante porque SAM 2.1 introduce mejoras sobre la versión original de SAM, ampliando la precisión y permitiendos un seguimiento más robusto de objetos en secuencias de vídeo. Al estar publicado en ONNX, resulta útil para desarrolladores que necesitan integrar la segmentación en pipelines ligeros o en producción con inferencia acelerada mediante CPU o GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico (Hiera) con memoria de atención para vídeo |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

SAM 2.1 Hiera Large se basa en la arquitectura Hiera, un backbone jerárquico de tipo transformer que procesa imágenes en múltiples escalas espaciales. El modelo original de SAM 2 incorpora además un mecanismo de memoria que permite el seguimiento de objetos en vídeo de forma online, procesando fotogramas consecutivos manteniendo un estado de memoria. El entrenamiento se realizó sobre un gran corpus de datos de imágenes y vídeo anotados con máscaras, aunque en la información proporcionada no se detalla el número de tokens ni la composición exacta del dataset. No se mencionan fases de RLHF ni DPO, ya que es un modelo de visión y no un modelo de lenguaje. La conversión a ONNX mantiene la arquitectura original pero en un formato de grafo estático que puede ejecutarse con ONNX Runtime, lo que puede introducir limitaciones en cuanto a entradas dinámicas o de tamaño variable según la exportación.

## Capacidades

- Segmentación interactiva de imágenes: permite generar máscaras de objetos a partir de puntos, cajas delimitadoras o máscaras previas.
- Seguimiento de objetos en vídeo: puede mantener el seguimiento de un objeto a lo largo de una secuencia de fotogramas.
- Segmentación zero-shot: es capaz de segmentar objetos no vistos durante el entrenamiento siguiendo las indicaciones del usuario.
- Procesamiento de imágenes y vídeo en formato ONNX: compatible con ONNX Runtime, lo que permite su uso en aplicaciones escritas en C++, Python, C# u otros lenguajes soportados.
- No soporta generación de texto, razonamiento, ni tool calling.
- No ofrece soporte de funciones ni capacidades de agente multi-paso.

## Casos de uso

- Anotación automática de datos para entrenamiento: el modelo puede generar máscaras a partir de pocos puntos, lo que permite a investigadores y equipos de datos etiquetar grandes conjuntos de imágenes o vídeos de forma semiautomática y acelerar la creación de datasets de segmentación.
- Edición de imágenes en aplicaciones móviles: gracias a su formato ONNX ligero, puede integrarse en apps de fotografía para recortar o aislar objetos con unos pocos toques, funcionando en CPU o GPU de dispositivos móviles mediante ONNX Runtime.
- Seguimiento de objetos en vídeo para análisis deportivo: permite seguir la trayectoria de un jugador o un balón a lo largo de una secuencia, generando máscaras consistentes y facilitando métricas de movimiento o análisis de jugadas.
- Segmentación de estructuras en imágenes médicas: en contextos de investigación con microscopía o radiología, el modelo puede usarse para delimitar regiones de interés de forma interactiva, siempre que se realice una adaptación al dominio o se utilice como asistente para especialistas.
- Integración en pipelines de visión con ONNX Runtime: al no depender de PyTorch, es adecuado para despliegues en entornos de producción con exigencias de arranque rápido o con requisitos de tamaño reducido, usando ONNX Runtime para CPU o GPU.
- Herramientas de inteligencia artificial en la nube: puede desplegarse como servicio de segmentación dentro de plataformas más grandes que manejan media o imágenes, usando contenedores que ejecutan ONNX Runtime y simplificando la gestión de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles en la información del repositorio.
- Puede ejecutarse en CPU o GPU a través de ONNX Runtime, pero no se especifican requisitos mínimos de hardware.
- Opciones de despliegue: compatible con ONNX Runtime en aplicaciones Python y C++, y potencialmente con otros runtimes que soporten ONNX, como ONNX Runtime Web en navegadores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Se comparan con otras conversiones a ONNX de SAM 2 disponibles en Hugging Face:

| Modelo | Base | Formato | Licencia | Parametros | Disponibilidad |
|---|---|---|---|---|---|
| bbalqq/sam2-onnx | facebook/sam2.1-hiera-large | ONNX | MIT | No disponible | Hugging Face |
| shubham0204/sam2-onnx-models | No indicado | ONNX | No disponible | No disponible | Hugging Face |
| aimi-models/sam2 | SAM2 (hiera-tiny, hiera-base-plus) | ONNX | Apache-2.0 | No disponible | Hugging Face |

Las tres opciones ofrecen un formato ONNX para SAM2. La licencia MIT del modelo analizado permite uso comercial sin restricciones, mientras que la opción de aimi-models utiliza Apache-2.0, que también es permisiva. La selección entre ellas dependerá de la variante de SAM2 deseada y de las dependencias de cada proyecto.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero el modelo hereda los sesgos de los datos de entrenamiento utilizados originalmente en SAM 2, que pueden incluir un rendimiento desigual en ciertos tipos de objetos o condiciones de iluminación.
- Riesgo de alucinación: como modelo de segmentación, puede generar máscaras incorrectas o sobresegmentar en zonas ambiguas de la imagen; no es un modelo de lenguaje, por lo que no presenta alucinaciones textuales.
- Limitaciones de contexto o idioma: el modelo no procesa texto y no soporta instrucciones en lenguaje natural; solo indica objetos mediante señales de entrada como puntos o cajas.
- Restricciones de licencia para uso comercial: la licencia MIT permite el uso comercial, incluida la modificación y distribución, siempre que se conserve el aviso de derechos de autor y la licencia.
- Requisitos de producción: al ser una exportación ONNX, algunas funcionalidades interactivas del modelo original podrían perder flexibilidad en cuanto a tamaños de entrada variables o ajustes dinámicos; es necesario validar la exportación en el entorno de despliegue concreto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bbalqq/sam2-onnx
- Repositorio alternativo de modelos ONNX de SAM2: https://huggingface.co/shubham0204/sam2-onnx-models
- Espejo ONNX de SAM2 con variantes tiny y base-plus: https://huggingface.co/aimi-models/sam2
- Modelo base original: https://huggingface.co/facebook/sam2.1-hiera-large
