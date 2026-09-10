# EigenLabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp

## Resumen

Este repositorio contiene una conversion a MLX en cuantizacion de 4 bits del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, publicada por el usuario EigenLabs. Se trata de un artefacto derivado del checkpoint oficial `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`: los pesos originales fueron convertidos al formato de MLX (Apple) con cuantizacion afina de 4 bits y grupo de 64, e incluyen ademas la cabeza de prediccion multi-token (MTP) integrada en los mismos ficheros safetensors, de modo que no hace falta descargar un modelo borrador aparte.

El modelo base es un transformer hibrido de la familia `nemotron_h`, que combina capas Mamba2, atencion y mezcla de expertos (MoE). Segun los metadatos de safetensors, la conversion contiene 32.913.261.824 parametros, aunque el nombre comercial del modelo indica 30B-A3B, lo que sugiere alrededor de 3.000 millones de parametros activos por token. Los idiomas declarados son ingles, castellano, frances, aleman, italiano y japones.

Su relevancia es fundamentalmente practica para el ecosistema Apple: permite ejecutar localmente un modelo MoE hibrido de gran tamano en Macs con memoria unificada, con pesos ya cuantizados y con la cabeza MTP lista para decodificacion especulativa, siempre que el runtime utilizado sepa gestionarla. No es una publicacion oficial de NVIDIA, sino una copia de una conversion MLX previa (atribuida a Jonathan Spangler / Darkbloom) orientada a trabajo de ingenieria de runtime nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h`: hibrida de Mamba2, atencion y MoE |
| Parametros totales | 32.913.261.824 (segun safetensors); el nombre comercial indica 30B |
| Parametros activos | No confirmado explicitamente; la nomenclatura «A3B» del nombre indica aproximadamente 3.000 millones activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, 4 bits, group size 64 (Q4/g64); pesos de normalizacion, parametros de router y otros parametros no cuantizados conservan su tipo de coma flotante nativo |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW 1.1 (heredada de NVIDIA); en el Hub figura como `license: other` |
| Formato de pesos | safetensors para MLX; 763 arrays de parametros indexados, de los cuales 34 corresponden al modulo MTP |
| Tamano del repositorio | 18,5 GB; carga tensorial almacenada de 18.526.974.592 bytes (17,25 GiB de safetensors con cabeceras) |
| Cabezal MTP | Integrado en los shards indexados, incluye `mtp.layers.*` |

## Arquitectura y entrenamiento

La arquitectura declarada es `nemotron_h`, un diseno hibrido que intercala bloques de estado (Mamba2) con bloques de atencion y capas de mezcla de expertos. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo la capacidad de los transformers clasicos, y la componente MoE mantiene bajo el numero de parametros activos por token en relacion con el total. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineamiento: esos datos corresponden a la model card original de NVIDIA, que no forma parte de la informacion proporcionada.

La innovacion tecnica destacable de esta conversion es la preservacion de la cabeza de prediccion multi-token (MTP). El checkpoint oficial contiene 270 tensores `mtp.*`; tras apilar los expertos enrutados y anadir escalas y offsets de cuantizacion, la conversion los conserva como 34 arrays de parametros MLX. La unica capa de prediccion incluye un bloque de atencion seguido de un bloque MoE: combina el embedding normalizado del siguiente token con los estados ocultos objetivo normalizados posteriores a `norm_f`, aplica `eh_proj`, los bloques residuales de atencion y MoE, y una normalizacion final, compartiendo los embeddings y la proyeccion de salida del modelo objetivo. La conversion se hizo con un adaptador local sobre las primitivas Nemotron de MLX-LM, porque el saneador estandar de la version instalada eliminaba esos tensores.

Es importante distinguir entre pesos embebidos y activacion en tiempo de ejecucion: un runtime consciente de MTP debe cargar la cabeza, proponer tokens borrador, verificarlos contra el modelo objetivo y confirmar o revertir correctamente el estado de atencion y de Mamba. Los runtimes sin ese soporte pueden ejecutar el modelo objetivo de forma serial e ignorar la cabeza incluida.

## Capacidades

- Generacion de texto y uso conversacional, con la etiqueta `text-generation` y `conversational` en el Hub.
- Cobertura multilingue declarada en seis idiomas: ingles, castellano, frances, aleman, italiano y japones.
- Razonamiento, matematicas y generacion de codigo: capacidades esperables del modelo base, pero no documentadas de forma especifica en la informacion disponible.
- Prediccion multi-token (MTP) para decodificacion especulativa, con la cabeza embebida en los pesos; requiere un runtime compatible para aprovecharla.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es de texto.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener dialogos multi-turno en seis idiomas sin enviar datos a servicios externos, algo relevante para entornos con requisitos de privacidad o para trabajo sin conectividad.
- Procesamiento de documentos sensibles en local: resumen, reescritura y extraccion de informacion de contratos, informes medicos o documentacion interna que no puede salir de la maquina, aprovechando la cuantizacion de 4 bits para caber en memoria unificada de 32 GB o mas.
- Desarrollo de software en equipo con politica de no filtrado: autocompletado y explicacion de codigo en el editor, con los pesos residiendo en el propio portatil o estacion de trabajo Apple.
- Prototipado de decodificacion especulativa: este artefacto sirve para experimentar con la cabeza MTP integrada, midiendo tasas de aceptacion de tokens borrador y comparando el comportamiento entre runtimes (por ejemplo, Python MLX frente al runtime nativo Swift).
- Investigacion sobre arquitecturas hibridas Mamba2 + atencion + MoE: permite estudiar el comportamiento de un modelo de este tipo en hardware de consumo Apple y contrastarlo con implementaciones en CUDA.
- Evaluacion comparativa de runtimes: dado que el repositorio documenta diferencias de precision entre implementaciones (los estados ocultos y logits no coinciden numericamente entre Python y Swift a tolerancia estricta), es un banco de pruebas util para validar portabilidad de pesos cuantizados.
- Despliegue en aplicaciones de escritorio macOS: integracion en herramientas de productividad o asistentes internos que se distribuyen como binario nativo y necesitan inferencia embebida.
- Bases para ajuste fino ligero (LoRA): al estar en formato MLX, puede servir como punto de partida para experimentos de adaptacion con el ecosistema MLX en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente documenta comprobaciones de validacion tecnica, que no deben interpretarse como medidas de calidad, velocidad ni cualificacion para todas las configuraciones de hardware:

| Comprobacion | Resultado documentado |
|---|---|
| Carga estricta del modelo | Correcta con las definiciones completas de objetivo y modulo MTP; el inventario de cabezas guardadas se verifico contra el inventario de modulos convertidos |
| Comprobacion nativa en Swift | Coincidencia con los 32 tokens deterministas de referencia del modelo MLX en Python |
| Comprobacion de cabeza cargada (tres pruebas) | Mismos identificadores de borrador voraz que la referencia en Python |
| Precision numerica entre runtimes | Python y Swift **no** producen estados ocultos ni logits numericamente identicos a tolerancia estricta |
| Aislamiento de peticiones, descarte/reintento, inventario cuantizado y pruebas de liberacion | Superadas |
| Activacion HTTP de MTP en Darkbloom y cualificacion de stream completo | En curso en el momento de la publicacion inicial |

## Requisitos de hardware

- Espacio en disco: aproximadamente 18,5 GB para el repositorio y 17,25 GiB de carga tensorial en safetensors.
- Memoria: al ser pesos de 4 bits con escalas y offsets adicionales, la carga en memoria se situa en torno a los 18-20 GB; se recomienda un equipo con al menos 32 GB de memoria unificada para dejar margen al contexto, la cache KV y el estado de Mamba. Con 24 GB el margen es muy ajustado y dependera de la longitud de contexto.
- Plataforma: MLX esta disenado para Apple Silicon (familias M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se ejecuta de forma nativa en GPUs NVIDIA o AMD; seria necesaria una conversion a otro formato para CUDA.
- GPU recomendadas: no aplica en el sentido habitual; el equivalente funcional serian chips Apple con memoria unificada amplia (M-series Max o Ultra). No hay datos de compatibilidad con A100, H100 o RTX 4090 para este artefacto.
- Cabe en GPU de consumo: el artefacto esta pensado para equipos Apple. En el ecosistema CUDA habria que reconvertir los pesos; no hay informacion sobre viabilidad en tarjetas de 16 GB o 24 GB.
- Opciones de despliegue: MLX-LM (`mlx_lm.generate`), runtimes nativos compatibles con MTP y el runtime Darkbloom. `llama.cpp`, Ollama, vLLM o TGI no son aplicables directamente a pesos MLX.
- Latencia y throughput estimados: no disponibles. La model card no incluye ninguna cifra de velocidad ni de ganancia por MTP, y advierte explicitamente que sus comprobaciones no constituyen una afirmacion de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (original) | Mismo modelo base (cifra exacta no disponible) | BF16 (sin cuantizar) | safetensors (PyTorch) | OpenMDW 1.1 | Checkpoint oficial de NVIDIA; incluye los 270 tensores `mtp.*` |
| EigenLabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp (este repositorio) | 32.913.261.824 | MLX affine 4 bits, group size 64 | safetensors MLX | OpenMDW 1.1 | Copia de la conversion MLX; 18,5 GB; MTP integrado; revision base `a9904d24bcc1d289a1950fa9d2b978c47cf903b9` |
| Spangler3000/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp | Mismo | MLX affine 4 bits, group size 64 | safetensors MLX | OpenMDW 1.1 | Conversion MLX original de la que deriva este repositorio (revision `6cdb7f43467ed3b4802e08eadc3275d02f12b8a8`); pesos, tokenizer, configuracion y tensores MTP sin cambios |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (MoE hibridos Mamba2 + atencion con tamano similar) dentro de los datos proporcionados, por lo que no se incluyen filas adicionales para evitar datos no verificados.

## Limitaciones y advertencias

- No es una publicacion oficial de NVIDIA. Es una conversion y copia de terceros; para uso previsto, limitaciones, evaluacion y seguridad hay que remitirse a la model card original de NVIDIA.
- Sesgos conocidos: no documentados en la informacion disponible. Al tratarse de un modelo entrenado con datos web a gran escala, es razonable esperar sesgos sociales y culturales, pero no hay datos concretos que los cuantifiquen.
- Riesgo de alucinacion: intrínseco a los modelos generativos de este tipo. No se documenta ningun mecanismo especifico de mitigacion ni evaluacion de veracidad en la informacion disponible.
- Limitacion importante de runtime: la cabeza MTP solo es util si el runtime la soporta explicitamente. El saneador estandar de algunas versiones de MLX-LM elimina estos tensores, y la model card advierte que ejecutar `mlx_lm.generate` no demuestra por si solo que MTP este activo.
- Diferencias numericas entre implementaciones: los estados ocultos y logits del runtime Swift y del modelo MLX en Python no coinciden a tolerancia estricta, aunque coincidan los identificadores de borrador voraz. Esto afecta a la reproducibilidad exacta entre plataformas.
- Estado de madurez: la activacion HTTP de MTP en Darkbloom y la cualificacion del stream completo seguian en curso en el momento de la publicacion, y la model card indica que no debe asumirse disponibilidad en un proveedor en produccion.
- Cobertura de idiomas: aunque se declaran seis idiomas, no se especifica el nivel de competencia por idioma; el castellano no necesariamente rinde igual que el ingles.
- Licencia: OpenMDW 1.1 heredada de NVIDIA. Antes de un uso comercial conviene revisar el texto completo de la licencia y las condiciones de atribucion, ya que el Hub la etiqueta como `license: other`.
- Longitud de contexto: no disponible, por lo que no puede garantizarse el rendimiento en ventanas largas ni el consumo de memoria asociado.
- Metadatos poco rodados: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su creador es un usuario independiente; no hay historial de uso que sirva como senal de calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EigenLabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp
- Modelo base oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Conversion MLX original (Spangler3000): https://huggingface.co/Spangler3000/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-4bit-mtp/tree/6cdb7f43467ed3b4802e08eadc3275d02f12b8a8
- Implementacion de referencia de MTP para Nemotron en oMLX: https://github.com/jundot/omlx/blob/main/omlx/patches/mlx_lm_mtp/nemotron_h_model.py
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a dominios sin relacion con el artefacto, por lo que no se incluyen.
