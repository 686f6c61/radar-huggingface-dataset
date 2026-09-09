# Eyeline-Labs/ID-V2V

## Resumen

ID-V2V es un modelo de código abierto de generación de vídeo desarrollado por Eyeline-Labs y presentado en SIGGRAPH Asia 2026. Su objetivo es el restyling de vídeo preservando la identidad: a partir de un vídeo fuente, una imagen clave estilizada (opcionalmente varias y un prompt de texto), genera un nuevo vídeo que sigue el estilo y la iluminación de la imagen, pero mantiene la identidad, las expresiones, la mirada y el movimiento de los sujetos originales. Es un finetune del modelo Wan-AI/Wan2.1-I2V-14B-720P e incorpora control VACE.

El modelo se distribuye en dos checkpoints con la misma arquitectura: `idv2v.pth`, que usa una sola condición de control (máscara de primer plano sobre gris), e `idv2v_with_normal_depth.pth`, que añade normales de superficie y profundidad para un control geométrico más fino. Su licencia es Apache-2.0, pero el propio autor lo presenta como un artefacto de investigación para demostración e inspiración, no como herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo basada en Wan 2.1 image-to-video con control VACE |
| Parametros totales | 14B (heredados del modelo base Wan2.1-I2V-14B-720P) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos completos en .pth) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | .pth (checkpoints de PyTorch) |

## Arquitectura y entrenamiento

ID-V2V es un finetune del modelo Wan 2.1 image-to-video de 14B parámetros con control VACE. La arquitectura subyacente es un modelo de difusión de vídeo que genera el resultado condicionado a un vídeo fuente, una imagen de referencia y señales de control adicionales. VACE (Video Composition and Editing) aporta mecanismos de control espacial y temporal que permiten al modelo atender a condiciones como máscaras, normales y profundidad.

El README detalla dos checkpoints: `idv2v.pth`, que utiliza una única condición de control (píxeles de primer plano sobre gris, con el sujeto segmentado mediante SAM3), e `idv2v_with_normal_depth.pth`, que añade normales de superficie (DAViD) y profundidad (DepthAnything-V2). Ambos comparten arquitectura pero tienen pesos distintos y no son intercambiables. No se publican detalles del conjunto de datos de entrenamiento ni de las fases de ajuste.

## Capacidades

- Restyling de vídeo con preservación de identidad: mantiene la identidad, las expresiones faciales, la mirada y el movimiento del sujeto original.
- Reiluminación y cambio de estilo: la escena, la iluminación y el estilo del nuevo vídeo siguen las imágenes de referencia.
- Soporte de escenarios con un solo sujeto y con múltiples sujetos, según la documentación del autor.
- Control condicional mediante keyframes adicionales y prompt de texto.
- Dos variantes de control: una con solo máscara de primer plano y otra que añade normales y profundidad para un control geométrico más preciso.
- No es un modelo de lenguaje: no ofrece tool calling, generación de texto ni razonamiento simbólico.

## Casos de uso

- Postproducción cinematográfica: permite restilizar tomas ya rodadas, cambiando la iluminación o la estética sin necesidad de volver a rodar.
- Reelaboración de personajes: modifica el aspecto de un actor en un vídeo manteniendo su actuación, expresiones y gestos, útil para dobles o efectos visuales.
- Prototipado visual: genera distintas versiones estilísticas de una misma escena para explorar opciones creativas antes de la edición final.
- Edición de vídeo con control geométrico: la variante con normales y profundidad permite controlar con más precisión las regiones regeneradas, útil en composición y corrección de planos.
- Contenido para redes sociales: transforma vídeos existentes en estilos artísticos variados manteniendo a la persona y su actuación.
- Investigación en vídeo generativo: sirve como base para experimentar con control de identidad, reiluminación y composición de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La página del proyecto afirma que el modelo supera a métodos existentes en preservar la semejanza facial y la actuación fina, pero no se proporcionan tablas ni cifras concretas.

## Requisitos de hardware

- VRAM estimada: no se han publicado requisitos oficiales. Dado que el modelo tiene 14B parámetros, se necesitan al menos 28 GB de VRAM para los pesos en fp16, más la memoria de activaciones; en la práctica se recomienda una GPU de 40 GB o más.
- GPU recomendadas: NVIDIA A100 80GB o H100. No es viable en GPUs de consumidor de 8-24 GB.
- Opciones de despliegue: el modelo no es un LLM, por lo que no se integra con vLLM, llama.cpp ni TGI. Se ejecuta mediante el código del repositorio oficial de GitHub con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se conocen alternativas directas de código abierto en la información proporcionada. La comparación más próxima es con su modelo base Wan-AI/Wan2.1-I2V-14B-720P, que genera vídeo a partir de una imagen pero no preserva identidad ni realiza restyling. Otras herramientas de video-to-video como Runway Gen-3 o Kling son propietarias y no están disponibles en open source.

## Limitaciones y advertencias

- Artefacto de investigación: el README lo declara como «liberado para demostración e inspiración», no para producción.
- Dependencia de la segmentación SAM3 en la variante por defecto; si la máscara de primer plano falla, la identidad se degrada.
- Los dos checkpoints no son intercambiables: cargar el incorrecto no genera error, solo degrada la salida silenciosamente.
- Riesgo de alucinación en las regiones regeneradas, especialmente fuera del sujeto segmentado.
- No se publican datos de entrenamiento, lo que impide evaluar sesgos de forma independiente.
- Sin benchmarks públicos, el rendimiento no se puede validar de forma externa.

## Enlaces

- HuggingFace: https://huggingface.co/Eyeline-Labs/ID-V2V
- Paper: https://huggingface.co/papers/2607.22830
- Página del proyecto: https://eyeline-labs.github.io/ID-V2V/
- Código: https://github.com/Eyeline-Labs/ID-V2V
