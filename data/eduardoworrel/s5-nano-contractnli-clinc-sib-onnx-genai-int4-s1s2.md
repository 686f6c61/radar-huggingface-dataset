# eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

S5-nano ContractNLI + CLINC150 + SIB-200 specialist es una adaptacion multitaréa del modelo base maritaca-ai/S5-nano, publicada por el usuario eduardoworrel. Anade una cabeza de clasificacion independiente por tarea sobre el modelo base: inferencia de contrato (ContractNLI: si una hipotesis se deriva, se contradice o no se menciona en un NDA), deteccion de consultas fuera de alcance (CLINC150, formulada como clasificacion binaria) y clasificacion tematica multilingue (SIB-200 en ingles y portugues). Cada decision se resuelve en un unico forward pass con una probabilidad y un margen asociados.

El modelo se distribuye como grafo ONNX int4 para onnxruntime-genai con ejecucion en navegador mediante WebGPU a traves de la libreria s1s2. El artefacto pesa 2,44 GB y esta pensado para desplegarse en cliente, sin servidor GPU, lo que resulta relevante para aplicaciones de analisis documental o filtrado de consultas con requisitos de privacidad y baja latencia.

La relevancia actual reside en su enfoque de dos sistemas: una pasada rapida (System 1) resuelve la clasificacion y solo cuando el margen es bajo se escala a generacion (System 2) para explicar o refinar la decision. La licencia es CC BY-SA 4.0 por la inclusion de SIB-200 en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base S5-nano (incluye capas GatedDeltaNet) con cabezas de clasificacion por tarea; grafo ONNX int4 para onnxruntime-genai |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI (limite declarado en la model card) |
| Tipos de cuantizacion | int4 (unico formato publicado) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai, grafo WebGPU); adaptador PyTorch y cabezas en el repo LoRA asociado |

## Arquitectura y entrenamiento

El modelo parte de maritaca-ai/S5-nano (Apache-2.0), cuyas capas GatedDeltaNet no tienen kernel de CPU en el grafo WebGPU publicado, por lo que la ejecucion queda restringida a WebGPU. Sobre ese backbone se anaden cabezas especificas por tarea: ContractNLI (tres clases: Entailment, Contradiction, Not mentioned), CLINC150 (binaria: Yes/No para dentro/fuera de alcance) y SIB-200 (siete clases tematicas en ingles y portugues). Las cabezas se entrenaron con palabras de opcion exactas y en cualquier orden; el prompt que lee la cabeza debe usar esas palabras literales o la prediccion no es valida.

Los datos de entrenamiento son ContractNLI (Koreeda y Manning, 2021; CC BY 4.0), CLINC150 (Larson et al., 2019; CC BY 3.0) y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO. La innovacion destacable es el esquema System 1 / System 2 con puerta por margen: la clasificacion se obtiene en una pasada y solo se invoca generacion cuando el margen cae por debajo de un umbral calibrado sobre datos etiquetados propios. Se incluye ademas una cabeza de evidencia (seleccion del span del contrato que soporta la decision) en `heads/evidence_cnli/`, aunque s1s2 0.1 aun no la utiliza.

## Capacidades

- Clasificacion de inferencia de contrato (ContractNLI): determina si una hipotesis se deriva, se contradice o no se menciona en un NDA de hasta 2.048 tokens.
- Deteccion de consultas fuera de alcance (CLINC150) como clasificacion binaria dentro/fuera de dominio.
- Clasificacion tematica (SIB-200) en siete categorias, en ingles y portugues.
- Salida tipada por decision: opcion elegida, probabilidad y margen.
- Escalado condicional a generacion (System 2) para explicar la decision en una frase cuando el margen es bajo.
- Extraccion de evidencia en contratos mediante cabeza dedicada (disponible en el repo, no integrada en s1s2 0.1).
- Ejecucion en navegador con WebGPU; sin soporte de CPU para las capas GatedDeltaNet.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Revision de NDA en cliente: el modelo clasifica si una clausula propuesta se deriva, contradice o no aparece en el contrato, ejecutandose en el navegador del usuario sin enviar el documento a un servidor, lo que facilita el cumplimiento de privacidad.
- Filtrado de consultas en asistentes conversacionales: CLINC150 en modo binario permite descartar peticiones fuera de alcance antes de invocar un modelo generativo mayor, reduciendo coste y latencia.
- Enrutado tematico de contenidos en ingles y portugues: SIB-200 asigna cada texto a una de siete categorias para alimentar pipelines de recomendacion o moderacion.
- Triaje documental con explicacion: cuando el margen de ContractNLI es bajo, la escalada a generacion produce una justificacion de una frase que el revisor humano puede auditar.
- Extraccion de evidencia contractual: la cabeza `evidence_cnli` localiza el span que soporta la decision, util para resaltar la clausula relevante en una interfaz de revision.
- Despliegue en aplicaciones web sin backend GPU: el grafo ONNX int4 de 2,44 GB se carga en Chrome con WebGPU, adecuado para herramientas internas o demos que no pueden asumir coste de servidor.
- Preclasificacion en pipelines de compliance: la salida con probabilidad y margen permite definir umbrales de autoaprobacion y derivar el resto a revision manual.

## Benchmarks y rendimiento

Resultados medidos sobre el build int4 ONNX con ONNX Runtime CUDA (A40) y particiones de test oficiales; precision balanceada por cabeza.

| Conjunto de test | Precision balanceada (%) | Azar (%) |
|---|---|---|
| CLINC150 fuera de alcance, n = 2.000 | 93,7 | 50 |
| ContractNLI, n = 1.190 | 78,1 | 33,3 |
| SIB-200 ingles, n = 204 | 90,7 | 14,3 |
| SIB-200 portugues, n = 204 | 90,8 | 14,3 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre la particion de desarrollo: CLINC150 93,1 y ContractNLI 77,1. No se ha ejecutado la prueba completa en navegador sobre test.

Fidelidad frente al modelo PyTorch bf16 del especialista: n = 992 elementos de desarrollo (ContractNLI 442 y CLINC150 550); la decision coincide en el 97,3 % de los elementos con lectura por cabeza (intervalo del 95 %: 96,1 a 98,1) y en el 95,3 % con lectura por logits. Las cabezas SIB-200 no tienen medicion de fidelidad por falta de salidas de referencia en desarrollo.

## Requisitos de hardware

- Descarga del grafo: 2,44 GB (ONNX int4 para WebGPU).
- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del artefacto sugiere un consumo en el orden de pocos GB, pero no se publica la cifra.
- GPU recomendadas: no se documentan; las mediciones se hicieron en una A40 (servidor, ONNX Runtime CUDA) y en una Apple M2 Pro (navegador, WebGPU).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; requiere WebGPU y no hay kernel de CPU para las capas GatedDeltaNet.
- Opciones de despliegue: onnxruntime-genai con WebGPU en navegador mediante la libreria s1s2 (`@s1s2/web`); el adaptador PyTorch y las cabezas estan en el repo LoRA asociado.
- Latencia y throughput: no publicados; solo se indica que cada decision se resuelve en un unico forward pass.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion disponible. Como referencias del mismo ecosistema cabe citar el modelo base maritaca-ai/S5-nano (Apache-2.0, sin cabezas especializadas) y los precursores alias3-web y el trabajo del Browser Immune System (arXiv 2611.15302), si bien no se aportan datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| S5-nano ContractNLI + CLINC150 + SIB-200 (este) | no disponible | 2.048 (ContractNLI) | CC BY-SA 4.0 | ONNX int4 | Multitarea especializada en navegador |
| maritaca-ai/S5-nano (base) | no disponible | no disponible | Apache-2.0 | safetensors | Modelo general sin cabezas |
| alias3-web | no disponible | no disponible | no disponible | no disponible | Precursor en navegador |

## Limitaciones y advertencias

- Restriccion de plataforma: el grafo es exclusivamente WebGPU; no hay kernel de CPU para las capas GatedDeltaNet, lo que impide ejecutarlo en entornos sin WebGPU.
- ContractNLI limitado a NDA de hasta 2.048 tokens; contratos mas largos requieren troceado previo.
- CLINC150 se plantea como clasificacion binaria dentro/fuera de alcance, no como clasificacion de intenciones completa.
- Las etiquetas SIB-200 en portugues se proyectan desde el ingles, lo que puede introducir sesgo de traduccion.
- Las cabezas solo funcionan con las palabras de opcion exactas del entrenamiento; cualquier variacion invalida la prediccion.
- La cabeza de evidencia no esta integrada en s1s2 0.1.
- Riesgo de alucinacion en la fase System 2 (generacion de explicaciones), aunque la respuesta tipada se conserva.
- Licencia CC BY-SA 4.0 con clausula ShareAlike: las obras derivadas deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial propietario.
- No se han publicado mediciones de fidelidad para las cabezas SIB-200 ni pruebas completas en navegador sobre test.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Adaptador PyTorch y cabezas: https://huggingface.co/eduardoworrel/S5-nano-ContractNLI-CLINC-SIB-LoRA
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Receta de entrenamiento (Kev): https://github.com/jaredpalmer/kev
