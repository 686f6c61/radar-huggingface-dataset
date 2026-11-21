# ramithuh/antifold-esmif1-webgpu

## Resumen

`ramithuh/antifold-esmif1-webgpu` es un paquete de pesos en formato safetensors preparado para ejecucion nativa en navegador mediante WebGPU. No se trata de un modelo nuevo, sino de una redistribucion optimizada de la arquitectura GVP-Transformer de 142M parametros que comparten dos modelos de inverse folding proteico: AntiFold (especializado en diseno de anticuerpos y nanobodies) y ESM-IF1 (modelo general de prediccion de secuencia a partir de estructura). El autor es `ramithuh` y el repositorio esta publicado bajo licencia BSD 3-Clause.

El objetivo del paquete es permitir inferencia de diseno de proteinas directamente en el navegador sin backend, fragmentando los pesos en shards de 25 MB o menos para facilitar su carga progresiva. Incluye cuatro variantes: AntiFold en int8 y fp16, y ESM-IF1 en int8 y fp16, con tamanos de aproximadamente 137 MB y 271 MB respectivamente por modelo.

La relevancia actual reside en la combinacion de WebGPU, cuantizacion int8 y modelos de inverse folding en un unico artefacto verificable, algo poco habitual en el ecosistema de diseno de proteinas, donde la mayoria de implementaciones requieren GPU dedicada y entornos Python. La verificacion reportada por el autor incluye 42 casos en GPU NVIDIA GB10 con un error relativo RMS maximo de 9,45e-5 en trazas intermedias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GVP-Transformer (shared backbone para AntiFold y ESM-IF1) |
| Parametros totales | 142M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 y fp16 |
| Idiomas soportados | no aplica (modelo de proteinas, no de lenguaje natural) |
| Licencia | BSD 3-Clause (AntiFold); ESM-IF1 MIT |
| Formato de pesos | safetensors (shards <= 25 MB) |
| Tamano del repo | 0,9 GB |
| Variantes incluidas | antifold/int8 (~137 MB), antifold/fp16 (~271 MB), esmif1/int8 (~137 MB), esmif1/fp16 (~271 MB) |
| Runtime objetivo | WebGPU (navegador) |
| Hardware de verificacion | NVIDIA GB10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un GVP-Transformer (Geometric Vector Perceptron + Transformer) de 142M parametros. Este diseno procesa grafos de estructura proteica con caracteristicas escalares y vectoriales, combinando capas GVP para el modelado geometrico con atencion transformer para el contexto secuencial. AntiFold y ESM-IF1 comparten el mismo backbone y difieren en el entrenamiento y en la especializacion: AntiFold se entrena especificamente para inverse folding de regiones CDR en cadenas VH/VL y nanobodies VHH, mientras que ESM-IF1 es un modelo general de prediccion de secuencia dada la estructura.

El paquete no documenta detalles adicionales sobre el dataset de entrenamiento, numero de tokens, composicion ni si se aplico RLHF o DPO; esa informacion corresponde a los trabajos originales (Hoie et al., 2024 para AntiFold; Hsu et al., 2022 para ESM-IF1). La innovacion tecnica de este repositorio es la conversion a safetensors fragmentados en shards de 25 MB y la cuantizacion int8 orientada a WebGPU, con verificacion numerica frente a las trazas de referencia en CPU y GPU.

## Capacidades

- Inverse folding proteico: predice la secuencia de aminoacidos dada una estructura 3D de proteina.
- Diseno de anticuerpos: modelado de regiones CDR en cadenas VH/VL.
- Diseno de nanobodies: soporte especifico para dominios VHH.
- Inferencia en navegador mediante WebGPU sin backend adicional.
- Ejecucion en precision int8 y fp16 con pesos safetensors.
- Carga progresiva por shards de 25 MB o menos.
- Verificacion numerica de trazas intermedias (relRMS reportado por el autor).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo especializado de biologia estructural.

## Casos de uso

- Diseno de anticuerpos terapeuticos: dado el esqueleto 3D de un anticuerpo, AntiFold predice secuencias CDR candidatas para optimizar afinidad o estabilidad, con la ventaja de ejecutarse en navegador para prototipado rapido.
- Ingenieria de nanobodies: uso de la variante VHH de AntiFold para rediseñar dominios variables de cadena pesada de camello, util en diagnostico y terapias de bajo peso molecular.
- Prediccion general de secuencia desde estructura: ESM-IF1 permite recuperar secuencias plausibles para estructuras resueltas por criomicroscopia o predicciones de AlphaFold.
- Validacion de pipelines de inverse folding: comparacion de resultados int8 frente a fp16 en el navegador para evaluar degradacion numerica antes de desplegar en produccion.
- Educacion y demos interactivas: aplicaciones web que muestran diseno de proteinas en tiempo real sin instalacion, gracias a WebGPU y shards pequenos.
- Prototipado de herramientas de biologia computacional: integracion en cuadernos o interfaces web que necesitan inferencia local sin GPU dedicada ni backend Python.
- Auditoria de reproducibilidad: el paquete incluye verificacion de trazas intermedias, util para validar conversiones de pesos en entornos WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento reportados por el autor son de latencia de inferencia en WebGPU sobre NVIDIA GB10:

| Caso | Precision | Latencia en caliente |
|---|---|---|
| ESM-IF1, 20 aminoacidos | INT8 | 147 ms |
| VHH, 105 aminoacidos | INT8 | 326 ms |
| Anticuerpo H+L, 236 aminoacidos | INT8 | 732 ms |

Verificacion numerica: 14 casos en CPU y 42 casos en GPU, 0 omisiones, peor relRMS en trazas intermedias de 9,45e-5.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo completo en fp16 ocupa aproximadamente 271 MB por variante, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: cualquier GPU compatible con WebGPU; el autor verifico en NVIDIA GB10.
- Cabe en GPU consumer: si, practicamente cualquier GPU moderna con soporte WebGPU (integrada o dedicada) puede ejecutar las variantes int8 y fp16.
- Opciones de despliegue: navegador con WebGPU como runtime principal; el paquete esta disenado para carga por shards en cliente.
- Latencia: 147 ms (ESM-IF1 20 aa), 326 ms (VHH 105 aa) y 732 ms (Ab H+L 236 aa) en INT8 sobre GB10.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| ramithuh/antifold-esmif1-webgpu | 142M | no disponible | Inverse folding anticuerpos + general, WebGPU | BSD 3-Clause / MIT | safetensors (shards 25 MB) |
| AntiFold original (oxpig/AntiFold) | 142M | no disponible | Inverse folding anticuerpos | BSD 3-Clause | PyTorch |
| ESM-IF1 original (facebookresearch/esm) | 142M | no disponible | Inverse folding general | MIT | PyTorch |
| ProteinMPNN | no disponible en la informacion | no disponible | Inverse folding general | MIT | PyTorch |

La comparativa se limita a los modelos de los que se dispone informacion en el contexto; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni responde a prompts conversacionales.
- La informacion sobre sesgos, alucinacion y limitaciones biologicas no esta documentada en la model card; debe consultarse la documentacion de AntiFold y ESM-IF1 originales.
- El rendimiento verificado se limita a NVIDIA GB10; no se garantiza el mismo comportamiento en otras GPU o navegadores con implementaciones WebGPU distintas.
- La cuantizacion int8 introduce error numerico (relRMS reportado de hasta 9,45e-5); para aplicaciones sensibles conviene validar frente a fp16.
- La licencia BSD 3-Clause aplica a AntiFold; ESM-IF1 es MIT. El uso comercial debe respetar ambas licencias y las de los pesos originales.
- No se documentan limitaciones de longitud de contexto ni de tamano maximo de estructura de entrada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- El pipeline no esta declarado en Hugging Face, lo que puede complicar la integracion automatica con herramientas estandar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramithuh/antifold-esmif1-webgpu
- AntiFold (codigo original): https://github.com/oxpig/AntiFold
- ESM / ESM-IF1 (codigo original): https://github.com/facebookresearch/esm
- Referencia AntiFold: Hoie et al., 2024 (segun atribucion en la model card)
- Referencia ESM-IF1: Hsu et al., 2022 (segun atribucion en la model card)
