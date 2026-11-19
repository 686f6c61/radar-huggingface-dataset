# huggingface-mic/rtdetr_r50vd-mic

## Resumen

`rtdetr_r50vd-mic` es un artefacto de prueba publicado por la organización `huggingface-mic`, no un modelo utilizable en producción. Se trata de una versión reducida (*fixture*) del modelo de detección de objetos `PekingU/rtdetr_r50vd`, generada con pesos aleatorios (semilla 17) y una configuración de arquitectura recortada. El repositorio empaqueta los pesos reducidos, un manifiesto de contrato (`integration.json`), ejemplos de uso ejecutables para Transformers y un directorio de expectativas de framework, con el objetivo declarado de servir como banco de pruebas de integración.

El modelo subyacente, RT-DETR (Real-Time Detection Transformer), es un detector de objetos end-to-end basado en transformer que elimina la necesidad de componentes posteriores al procesamiento como NMS. La variante `r50vd` emplea un backbone ResNet-50 preentrenado con la receta VDL. Sin embargo, esta ficha describe exclusivamente el artefacto `-mic`, cuyo propósito es verificar contratos de integración, no realizar detección real.

La relevancia de esta ficha es acotada: sirve para desarrolladores que necesiten entender qué es un *fixture* MIC de Hugging Face y por qué no debe confundirse con un modelo funcional. El propio autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTDetrForObjectDetection (transformer de detección, configuración reducida) |
| Parametros totales | 10.927.020 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura `RTDetrForObjectDetection` pero con una configuración recortada mediante la regla genérica de `sweep.py`: `encoder_layers=1` y `decoder_layers=2`, frente a la configuración completa del modelo base. Los archivos de procesador (`preprocessor_config.json`) se copian byte a byte desde `PekingU/rtdetr_r50vd`, garantizando compatibilidad exacta con el preprocesamiento del modelo original.

Los pesos son aleatorios (semilla 17) y no han pasado por ningún entrenamiento. El autor justifica esta decisión indicando que superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `pixel_values:halve`, produjo 0,129). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. No hay datos de entrenamiento, RLHF ni DPO asociados.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen detecciones con significado semántico.
- Verificación de contratos de integración: permite comprobar que un pipeline de Transformers carga, preprocesa y ejecuta el modelo sin errores de forma o dtype.
- Pruebas de sensibilidad a la entrada: el fixture responde a perturbaciones de `pixel_values`, lo que permite validar que el cableado de entrada está correctamente conectado.
- Compatibilidad de nombres de tensores: al replicar los nombres del checkpoint real, sirve para validar scripts de carga y conversión de pesos.
- Comprobación de dtypes: ejecutable en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por su naturaleza de modelo de visión y de artefacto de prueba.

## Casos de uso

- Pruebas de integración en CI/CD: usar el fixture para verificar que la versión de Transformers del proyecto carga correctamente un `RTDetrForObjectDetection` sin descargar el checkpoint completo de 40M+ parámetros.
- Validación de pipelines de preprocesamiento: comprobar que el `preprocessor_config.json` copiado del modelo real se aplica correctamente sobre imágenes de entrada antes de la inferencia.
- Desarrollo de herramientas de conversión de pesos: validar scripts que renombran o transforman tensores contra un modelo con los mismos nombres que el checkpoint original pero con un tamaño manejable.
- Pruebas de tolerancia numérica: verificar que el código de entrenamiento o inferencia produce resultados finitos en float32, bfloat16 y float16 antes de escalar al modelo completo.
- Formación y documentación: ilustrar en talleres o documentación interna qué es un fixture MIC y cómo se estructura un repositorio de contrato de integración.
- Regresión de frameworks: detectar roturas en versiones nuevas de Transformers que afecten a la carga de modelos RT-DETR sin necesidad de disponer de GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto con pesos aleatorios, cualquier métrica de detección (mAP, latencia) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (10,9M de parámetros, aproximadamente 44 MB de pesos más activaciones de un backbone reducido).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060, RTX 3060 y superiores; también en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (PyTorch) es el framework de referencia según el contrato del repositorio; no se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput: no disponibles; al ser un fixture con encoder de 1 capa y decoder de 2 capas, la latencia sería muy inferior a la del modelo real, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/rtdetr_r50vd-mic` | 10,9M | Fixture RT-DETR | Pruebas de integración | no disponible | Hugging Face |
| `PekingU/rtdetr_r50vd` | no disponible en la información | RT-DETR real | Detección de objetos | no disponible | Hugging Face |
| `PekingU/rtdetr_r50vd_coco_o365` | no disponible en la información | RT-DETR real | Detección de objetos | no disponible | Hugging Face |

La comparación relevante es con el modelo base `PekingU/rtdetr_r50vd`: mismo nombre de tensores y mismo procesador, pero configuración recortada y pesos aleatorios. Cualquier otro detector RT-DETR de la familia PekingU sería una alternativa funcional, mientras que este artefacto no lo es.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no detecta objetos reales; sus salidas son numéricamente finitas pero semánticamente vacías.
- Etiquetado como `test-artifact`: el autor lo excluye explícitamente de la búsqueda de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede asumir ningún permiso de uso comercial sin consultar el repositorio del modelo base.
- Configuración recortada: `encoder_layers=1` y `decoder_layers=2` no representan el comportamiento del modelo completo; los tiempos y la memoria no son extrapolables.
- Sin datos de sesgo ni alucinación: al no ser un modelo generativo ni entrenado, no aplican las advertencias habituales de sesgo, pero tampoco existe garantía de comportamiento en dominios reales.
- Dependencia de la versión de Transformers: el contrato de integración está vinculado a una versión concreta del framework; cambios futuros pueden romper la compatibilidad.
- Tamaño del repo reportado como 0.0 GB: posible inconsistencia en los metadatos de Hugging Face que conviene verificar antes de automatizar descargas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic
- Modelo base: https://huggingface.co/PekingU/rtdetr_r50vd
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/rtdetr_r50vd-mic/blob/main/build.json
- Explicación del recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/rtdetr_r50vd-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de recorte: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
