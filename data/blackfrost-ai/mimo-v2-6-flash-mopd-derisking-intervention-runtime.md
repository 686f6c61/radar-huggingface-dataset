# Blackfrost-AI/MiMo-V2.6-Flash-MOPD-Derisking-Intervention-Runtime

## Resumen

Este repositorio no es un modelo de lenguaje, sino un paquete de ejecucion (runtime) para servir los checkpoints MiMo V2.6 Flash de Xiaomi en GPUs NVIDIA Blackwell. Lo publica Blackfrost-AI bajo licencia Apache-2.0 y contiene una capa de compatibilidad sobre SGLang 0.5.19, un instalador de overlay aislado, dos artefactos de direccion de activacion en BF16 de 4.096 dimensiones, un script de lanzamiento y una prueba de humo de la API. El tamano del repositorio es de 0,0 GB: los pesos, el tokenizer, los prompts capturados y los kernels compilados no se incluyen.

Su relevancia es doble. Por un lado, resuelve un problema de ingenieria concreto: la ruta MXFP4 del MoE de MiMo necesita seis modificaciones sobre SGLang 0.5.19 que no estan en la version oficial, y este paquete las aplica sin tocar el entorno Python compartido. Por otro, incorpora una intervencion en tiempo de ejecucion de tipo *representation engineering* que proyecta las activaciones tras la salida ponderada del router MoE en las capas 28 a 33, con alpha 3,5, para alterar el comportamiento del modelo sin modificar pesos ni decisiones del router.

La transferencia de direcciones desde `MiMo-V2.6-Flash-RL` hacia `MiMo-V2.6-Flash-MOPD` es experimental. La unica validacion publicada es una prueba de humo emparejada con 14 peticiones y dos llamadas a herramientas correctas, que el propio autor advierte que no constituye un benchmark amplio de calidad o seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) en el checkpoint base; el repositorio es una capa de ejecucion sobre SGLang, no un modelo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor de la configuracion probada) |
| Tipos de cuantizacion | MXFP4 en la ruta MoE probada con FlashInfer; no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (runtime y artefactos de direccion); los pesos se rigen por los terminos del repositorio upstream |
| Formato de pesos | no incluidos en el repositorio (0,0 GB); el checkpoint se descarga aparte desde XiaomiMiMo |

Otros datos de la configuracion probada: runtime SGLang 0.5.19, atencion FA4, topologia 4 x RTX PRO 6000 Blackwell con tensor parallel 4 (TP4), parsers de razonamiento y de llamadas a herramientas de MiMo, checkpoint `2479e2d0029eca9a34cc7e7f55a121925f81908e` y origen de direcciones `5711b268169967567844e1e560e8a3966da959b1`.

## Arquitectura y entrenamiento

El paquete no entrena ni afina nada: es software de inferencia. Modifica SGLang 0.5.19 con seis sobreescrituras necesarias para la ruta MXFP4 del MoE de MiMo en Blackwell, y anade una intervencion reversible. Para cada capa configurada, el runtime aplica dos proyecciones secuenciales de rango uno despues de la salida MoE ponderada por el router, segun la formula `y <- y - alpha * d * (d^T y)`, con vectores normalizados y re-ortogonalizados en el orden del manifiesto. En la configuracion por defecto se usan dos direcciones acumulativas, alpha 3,5 y las capas 28 a 33.

El diseno es defensivo: el cargador verifica el esquema del manifiesto, la procedencia de las direcciones, hashes SHA-256, orientacion, capas objetivo, valores alpha finitos y positivos, y el ancho del estado oculto antes de asignar los vectores en GPU. Las rutas de las direcciones quedan confinadas al directorio del manifiesto y las cargas de tensores usan el modo restringido `weights_only` de PyTorch. Ni los pesos ni las decisiones del router se modifican. La intervencion se activa con la variable de entorno `BLACKFROST_MIMO_MOE_INTERVENTION`, cuya configuracion se cachea por proceso.

Las direcciones se obtuvieron del checkpoint `MiMo-V2.6-Flash-RL` y se transfieren al `MiMo-V2.6-Flash-MOPD`, un salto que el autor califica de experimental. El paquete no soporta direcciones para `MiMo-V2.6-Pro-MOPD`, porque Pro usa un estado oculto de 6.144 dimensiones frente a las 4.096 de los vectores incluidos; ante ese desajuste, el cargador falla en cerrado en lugar de proyectar o rellenar los vectores. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en los checkpoints base.

## Capacidades

- Servicio de generacion de texto mediante una API compatible con OpenAI, a traves de SGLang 0.5.19 y los parsers de razonamiento y de llamadas a herramientas de MiMo.
- Modo de razonamiento (*thinking*) y soporte de tool calling, habilitados por los parsers de MiMo en la configuracion probada.
- Contexto de 262.144 tokens en la configuracion validada, apto para cargas con historiales largos o documentos extensos.
- Inferencia MoE cuantizada en MXFP4 sobre GPUs Blackwell, con atencion FA4 y kernel MoE de FlashInfer.
- Intervencion en activaciones en tiempo de ejecucion, reversible y desactivable, que permite comparar el comportamiento del modelo con y sin direcciones aplicadas sin tocar los pesos.
- Aplicacion de una o varias direcciones de activacion acumuladas, con control de capas objetivo y de la intensidad (alpha).
- Empaquetado reproducible: revisiones de codigo fijadas, hashes publicados, manifiesto de release y avisos de terceros.
- Verificacion de integridad y de compatibilidad previa a la asignacion de memoria en GPU.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como una direccion de activacion concreta altera el comportamiento de un MoE en produccion, con trazabilidad criptografica del artefacto y sin reentrenar pesos.
- Evaluacion de mitigacion de comportamientos indeseados: el paquete esta etiquetado como *security-research* y *derisking*, de modo que sirve para medir el efecto de proyecciones de rango uno sobre las capas 28 a 33 frente a una linea base sin intervencion.
- Despliegue de MiMo V2.6 Flash MOPD en Blackwell: la capa de compatibilidad resuelve las carencias de SGLang 0.5.19 en la ruta MXFP4, por lo que es el camino documentado para levantar el checkpoint en esa arquitectura.
- Comparativas A/B controladas: al poder desactivar la intervencion y arrancar SGLang directamente con el overlay materializado, permite medir diferencias de comportamiento atribuibles solo a las direcciones.
- Pipelines agente con llamadas a herramientas: los parsers de tool calling de MiMo permiten integrar el modelo en flujos multi-paso; la prueba de humo incluida valida dos llamadas a herramientas correctas.
- Procesamiento de documentos largos: los 262.144 tokens de contexto habilitan resumen, extraccion y respuesta sobre expedientes extensos sin troceado agresivo.
- Validacion continua en CI/CD: el script `smoke_test.py` comprueba `/models`, envia una completion determinista y exige una respuesta no vacia y correctamente terminada, lo que permite usarlo como puerta de calidad tras cambios de revision o de version de SGLang.
- Auditoria interna de despliegues gated: el repositorio es publico y con acceso manualmente restringido, de modo que encaja en flujos donde se necesita revisar artefactos de activacion antes de servir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia empirica aportada es una prueba de humo emparejada con 14 peticiones completadas y dos llamadas a herramientas correctas, que el autor describe explicitamente como insuficiente para extraer conclusiones de calidad o seguridad. No se publican cifras de latencia ni de throughput.

## Requisitos de hardware

- Topologia probada: 4 x NVIDIA RTX PRO 6000 Blackwell con tensor parallel 4 (TP4). No se documenta funcionamiento en otras topologias.
- VRAM estimada para inferencia: no disponible. Depende del checkpoint MXFP4, del contexto configurado y del numero de GPUs; el repositorio no publica pesos ni recuento de parametros.
- GPU recomendadas: la unica configuracion validada son las RTX PRO 6000 Blackwell. No hay datos publicados para A100, H100 u otras generaciones.
- Compatibilidad con GPU de consumo: no disponible. La ruta MXFP4 y la atencion FA4 probadas son especificas de Blackwell, por lo que no se puede asumir funcionamiento en tarjetas de gama de consumo.
- Opciones de despliegue: SGLang 0.5.19 con el overlay materializado; el paquete no documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Dependencias de plataforma: CUDA, PyTorch, FlashInfer y FlashAttention en versiones especificas de plataforma, registradas en `environment-tested.txt`. El script `materialize_overlay.py` exige un `sglang==0.5.19` limpio y no modifica nunca el paquete instalado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones de modelos comparables (parametros, contexto o resultados de evaluacion). Lo unico comparable son los repositorios de los que depende el paquete:

| Elemento | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| Blackfrost-AI/MiMo-V2.6-Flash-MOPD-Derisking-Intervention-Runtime | Runtime e intervencion | Overlay SGLang, dos direcciones BF16 de 4.096 dim, scripts de lanzamiento y prueba | Apache-2.0 | Publico con acceso manualmente restringido |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD | Checkpoint base | Pesos del modelo (no incluidos aqui) | Segun repositorio upstream | Repositorio upstream |
| XiaomiMiMo/MiMo-V2.6-Flash-RL | Checkpoint origen de las direcciones | Pesos y origen de los artefactos de direccion | Segun repositorio upstream | Repositorio upstream |
| MiMo-V2.6-Pro-MOPD | Checkpoint no soportado | Estado oculto de 6.144 dimensiones, incompatible con los vectores de 4.096 | Segun repositorio upstream | No soportado por este runtime |

No se dispone de datos de rendimiento, parametros o contexto de estos checkpoints en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene el modelo. Se descarga 0,0 GB: sin pesos, tokenizer, kernels compilados, prompts capturados, trazas de evaluacion ni credenciales de despliegue.
- La transferencia de direcciones de Flash-RL a Flash-MOPD es experimental y solo ha pasado una prueba de humo de 14 peticiones. No hay evaluacion amplia de calidad, seguridad ni alineacion.
- El paquete no es compatible con direcciones de `MiMo-V2.6-Pro-MOPD`; el cargador falla en cerrado ante el desajuste de 4.096 frente a 6.144 dimensiones.
- Existe una discrepancia de nomenclatura: el identificador del repositorio incluye `Derisking`, mientras que el comando de descarga de la model card usa `MiMo-V2.6-Flash-MOPD-Intervention-Runtime` sin ese termino. Conviene verificar la ruta exacta antes de automatizar descargas.
- La intervencion altera activaciones en capas concretas (por defecto 28 a 33, alpha 3,5). Puede degradar capacidades no medidas y su efecto depende del checkpoint, de la version de SGLang, de la arquitectura de GPU y del conjunto de direcciones empleado; el autor exige revalidar en cada cambio.
- Dependencia estricta de SGLang 0.5.19 y de un entorno GPU concreto: no hay garantia de funcionamiento con otras versiones de SGLang, CUDA, PyTorch, FlashInfer o FlashAttention.
- La API escucha en loopback por defecto. Si se expone a clientes remotos hay que anteponer autenticacion o un overlay privado, tal como advierte el autor.
- Uso comercial: el runtime y los artefactos de direccion son Apache-2.0, pero los pesos siguen sujetos a los terminos de su repositorio upstream, que deben revisarse por separado.
- Es software de investigacion con cero descargas y cero valoraciones en el momento de la consulta, sin historial de uso en produccion.
- Riesgo de alucinacion, sesgos y cobertura idiomatica: no disponible, ya que el repositorio no documenta caracteristicas del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Blackfrost-AI/MiMo-V2.6-Flash-MOPD-Derisking-Intervention-Runtime
- Checkpoint base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Checkpoint origen de las direcciones: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- SGLang (framework de servicio): https://github.com/sgl-project/sglang
- Documentos incluidos en el paquete, referenciados en la model card: `COMPATIBILITY.md`, `MODIFICATIONS.md`, `SECURITY.md`, `release-manifest.json`, `environment-tested.txt`
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo ni al runtime; los resultados devueltos corresponden a servicios de correo y no guardan relacion con el contenido de esta ficha.
