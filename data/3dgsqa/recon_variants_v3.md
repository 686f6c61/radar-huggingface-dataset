# 3DGSQA/recon_variants_v3

## Resumen

El repositorio `3DGSQA/recon_variants_v3` no es un modelo de inteligencia artificial generativa al uso, sino un conjunto de datos y pipeline de evaluación para la calidad perceptual de renderizados 3D Gaussian Splatting (3DGS). Lo publica el autor bajo el nombre 3DGSQA, vinculado al proyecto homónimo de evaluación de calidad de contenido 3DGS. Su propósito es generar variantes controladas de reconstrucciones 3D sobre seis objetos de referencia (procedentes de CO3Dv2, OmniObject3D y uCO3D), aplicando degradaciones sistemáticas en espacio de imagen y compresión, para permitir estudios rigurosos de calidad percibida.

El repositorio contiene 516 modelos 3DGS (86 combinaciones de configuración × 6 objetos), cada uno con su nube de puntos, un vídeo orbital en 1888×1080 y metadatos completos. Las degradaciones incluyen desenfoque de movimiento, obturador rodante, desenfoque por desenfoque (defocus), oclusión, degradaciones compuestas y compresión con diferentes niveles de severidad. Todos los modelos se generaron sin fallos y con verificaciones de monotonicidad y precisión de los parámetros objetivo. Es relevante ahora porque la calidad de los renderizados 3DGS es un problema abierto, y este recurso proporciona datos etiquetados y controlados para entrenar y validar métricas automáticas de calidad perceptual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (conjunto de modelos 3D Gaussian Splatting) |
| Parametros totales | No disponible (cada modelo 3DGS tiene un número de gaussianas que varía entre 1 656 y 3 494 382, mediana 373 010) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica (se aplica compresión MesonGS con niveles Z7 y Z8, ver README) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | `point_cloud.ply`, `config.json`, `orbit.mp4` (vídeo renderizado) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de red neuronal, sino un pipeline de generación de variantes de reconstrucción 3DGS. Se parte de una configuración base (`configs/3dgs_qa_config_v3.json`) que define 85 combinaciones de parámetros de entrenamiento y degradación, más una fila de control adicional. Sobre seis objetos seleccionados, se ejecuta un proceso de entrenamiento de modelos 3DGS (fases `base`, `train-short`, `train-long`) seguido de una fase de compresión (`compress`) y una fase de renderizado proxy para generar los vídeos orbitales.

Las degradaciones se aplican en espacio de imagen mediante scripts (`degrade.py`) e incluyen desenfoque de movimiento (D2), obturador rodante (D10), desenfoque por desenfoque (D11), oclusión (D13) y composiciones de degradaciones (D9). También se aplica una deformación intrínseca de cámara. La compresión se realiza con el pipeline MesonGS, cuyos niveles se parametrizan en `compress_params.json`. El entrenamiento se distribuye mediante Slurm en pools de GPU, con pre-procesado en CPU para los inputs compartidos.

## Capacidades

- Generación de modelos 3DGS con degradaciones controladas y verificadas (monotonicidad de severidad, precisión de objetivos).
- Evaluación de calidad perceptual de renderizados 3DGS mediante vídeos orbitales y metadatos de configuración.
- Soporte para múltiples tipos de degradación: desenfoque de movimiento, obturador rodante, desenfoque por desenfoque, oclusión y compresión.
- Incluye campos de metadatos para registrar colapso catastrófico (`collapse_flag`, `collapse_reason`) y preservación de identidad, aunque estos quedan deliberadamente nulos para revisión humana.
- Proporciona herramientas de inspección visual (`contact_sheet.py`) y de seguimiento de estado (`status.py`) para auditar la integridad del conjunto.
- Compatible con entornos de cálculo distribuido (Slurm) y con pools heterogéneos de GPU.

## Casos de uso

- Investigación en evaluación de calidad perceptual de renderizados 3DGS: el conjunto permite entrenar y validar métricas automáticas que predigan la calidad percibida bajo degradaciones conocidas.
- Desarrollo de algoritmos de compresión para 3DGS: los niveles de compresión Z7 y Z8 proporcionan datos etiquetados para comparar la pérdida de calidad frente a la tasa de compresión.
- Estudio de la influencia de parámetros de entrenamiento en la robustia del renderizado: las 85 combinaciones de configuración permiten aislar efectos de iteraciones, tasa de aprendizaje u otros hiperparámetros.
- Validación de métricas de calidad sin referencia (NR-IQA) en contenido 3D: los vídeos orbitales y las degradaciones controladas sirven como ground truth para evaluar predictores de calidad.
- Análisis de colapso catastrófico en reconstrucciones 3D: los campos `collapse_flag` y `collapse_reason` permiten etiquetar manualmente casos de fallo severo, útiles para estudiar límites de robustez.
- Comparación de diferentes algoritmos de renderizado o reconstrucción: el pipeline puede adaptarse para generar variantes de otros métodos y comparar su calidad con la misma batería de degradaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad perceptual en la información disponible. El README incluye verificaciones de control de las degradaciones, que se resumen a continuación:

| Degradación | Objetivo | Resultado |
|---|---|---|
| D2 desenfoque de movimiento | 6/12/24/48 px | 5.999 / 12.0 / 23.99 / 47.95 (spread ≤0.25 px) |
| D10 obturador rodante | 4/12/24/48 px | 4.0 / 12.0 / 23.99 / 47.97 (spread ≤0.32 px) |
| D11 desenfoque | P90 CoC 2/5/10/20 px | exacto, spread ~0 |
| D13 oclusión | área imagen 0.05/0.12/0.25/0.45 | 0.0500 / 0.1201 / 0.2500 / 0.4500 |
| D9 composición | igual a la composición de las seis filas V2 | verificado componente a componente |
| Compresión (mediana de seis objetos) | Z7 y Z8 | Z7 +0.7%, Z8 +4.3% del ratio de compresión etiquetado |

Estos datos confirman la precisión del control de degradaciones, pero no constituyen métricas de calidad del contenido en sí.

## Requisitos de hardware

- Para ejecutar el pipeline completo se requiere un clúster con Slurm y pools de GPU heterogéneos (el README menciona GPUs a6000 con límite de 4 jobs concurrentes).
- El pre-procesado de inputs se realiza en CPU (sin `--gres`), por lo que se necesita suficiente RAM y almacenamiento para los directorios de entrada (72 códigos por objeto).
- Para la fase de entrenamiento de modelos 3DGS se recomienda al menos 16 GB de VRAM por job (los modelos con hasta 3.4 millones de gaussianas pueden requerir más).
- Para la fase de compresión se necesitan pesos de VGG pre-entrenados (`vgg.pth` y `vgg16-397923af.pth`) en `~/.cache/torch/hub/checkpoints`.
- La visualización de los vídeos orbitales (1888×1080) no requiere hardware especial.
- No se proporcionan datos de latencia o throughput de inferencia, ya que no es un modelo de generación en tiempo real.

## Comparativa con modelos similares

Existen otros conjuntos de datos para evaluación de calidad de contenido 3D generado, como 3DGCQA (arxiv 2409.07236), pero no se dispone de información suficiente para una comparación cuantitativa. El repositorio `recon_variants_v3` se distingue por su enfoque en degradaciones controladas y verificadas sobre 3DGS, mientras que 3DGCQA cubre contenido 3D generado por IA en general. No se dispone de datos de otros benchmarks comparables con los mismos objetos y degradaciones.

## Limitaciones y advertencias

- No es un modelo de IA generativa; es un conjunto de datos y pipeline de evaluación. No puede utilizarse para generar contenido nuevo.
- La licencia no está especificada, por lo que su uso comercial y redistribución están sujetos a incertidumbre legal. Se recomienda contactar al autor antes de usarlo en producción.
- Los campos de colapso catastrófico (`collapse_flag`, `collapse_reason`) están deliberadamente vacíos; requieren etiquetado manual por humanos, lo que introduce subjetividad.
- La cobertura de objetos es limitada (6 objetos de 3 categorías), lo que puede no generalizar a todos los escenarios de renderizado 3D.
- Las degradaciones se aplican en espacio de imagen, no en el espacio 3D subyacente; los resultados pueden no reflejar artefactos geométricos reales de la reconstrucción.
- No hay información sobre sesgos o alucinaciones, al no tratarse de un modelo generativo de texto o imagen.
- Para reproducir el pipeline se requiere un clúster Slurm con configuración específica; no es trivial de ejecutar en una máquina única.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/3DGSQA/recon_variants_v3
- Proyecto 3DGSQA (GitHub): https://github.com/diaoyn/3DGSQA
- Paper de referencia sobre calidad perceptual de 3DGS (del proyecto 3DGSQA): no se ha localizado un enlace directo en la información disponible.
- Conjunto de datos relacionado 3DGCQA: https://arxiv.org/pdf/2409.07236
