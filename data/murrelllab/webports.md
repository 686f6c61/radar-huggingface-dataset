# MurrellLab/webports

## Resumen

El repositorio MurrellLab/webports aloja exportaciones ONNX de los checkpoints de ProteinMPNN, preparadas para su ejecucion en navegador mediante ONNX Runtime Web con WebAssembly o WebGPU. No es un modelo de lenguaje: se trata de un conjunto de nueve modelos de diseno de secuencias proteicas, incluidas variantes ProteinMPNN, solubleMPNN y CA-only.

MurrellLab (The Murrell Lab, KI) convirtio los checkpoints oficiales a un formato de grafo orientado a navegador. La conversion no implica nuevo entrenamiento; los modelos subyacentes fueron entrenados por los autores originales de ProteinMPNN. El repositorio resuelve el problema de ejecutar modelos de diseno de proteinas directamente en el navegador, sin infraestructura de servidor dedicada.

Cada bundle incluye un manifest.json con el SHA-256 del checkpoint de origen, el commit upstream, los hashes de los archivos exportados, las dimensiones de los tensores y el modo de atomos. Tambien se proporciona un indice global en webProteinMPNN/catalog.json.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (MPNN) - ProteinMPNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de diseno de proteinas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (para ONNX Runtime Web) |

## Arquitectura y entrenamiento

ProteinMPNN es una red neuronal de paso de mensajes (MPNN) que toma coordenadas de backbone proteico como entrada y predice secuencias de aminoacidos. El repositorio contiene versiones convertidas a grafos ONNX orientados a navegador, lo que permite la inferencia mediante ONNX Runtime Web con WebAssembly o WebGPU.

Los checkpoints subyacentes fueron entrenados por los autores originales de ProteinMPNN. MurrellLab realizo la conversion a formato ONNX, registrando en cada manifest.json el SHA-256 del checkpoint de origen, el commit upstream, los hashes de los archivos exportados, las dimensiones de los tensores y el modo de atomos. Los datos de entrenamiento del modelo subyacente no estan especificados en la informacion disponible.

## Capacidades

- Diseno de secuencias proteicas a partir de coordenadas de backbone proteico.
- Diseno de secuencias para estructuras CA-only (solo atomos alfa carbono).
- Soporte de la variante solubleMPNN.
- Ejecucion en navegador mediante WebAssembly o WebGPU con ONNX Runtime Web.
- No es un modelo de lenguaje: no genera texto, codigo ni respuestas en lenguaje natural.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (vision, audio, etc.).

## Casos de uso

- Diseno de secuencias proteicas en investigacion: los investigadores pueden generar secuencias candidatas a partir de estructuras de backbone directamente en el navegador, sin necesidad de servidores dedicados.
- Educacion en biologia computacional: estudiantes y docentes pueden experimentar con ProteinMPNN en un navegador compatible, evitando la instalacion de entornos de GPU locales.
- Integracion en plataformas web de bioinformatica: el formato ONNX y la compatibilidad con ONNX Runtime Web permiten incorporar diseno de proteinas en aplicaciones web existentes.
- Exploracion de disenos CA-only: cuando solo se dispone de las posiciones de los alfa carbonos, el modelo genera secuencias completas para estructuras parcialmente caracterizadas.
- Prototipado rapido de flujos de ProteinMPNN: los bundles permiten validar la inferencia en navegador antes de escalar a infraestructura de computo cientifico.
- Aplicaciones de diseno de proteinas de novo: el modelo puede explorar secuencias para estructuras disenadas computacionalmente durante el proceso de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card menciona que los detalles de validacion se mantienen en https://github.com/MurrellGroup/webProteinMPNN, pero no se proporcionan datos numericos en la informacion actual.

## Requisitos de hardware

- Tamano total del repositorio: 0,1 GB, distribuido en nueve bundles ONNX.
- Ejecucion en navegador via WebAssembly o WebGPU; no requiere GPU de servidor dedicada.
- No se especifican requisitos de VRAM en la informacion disponible.
- No hay datos sobre GPU recomendadas; el modelo esta pensado para ejecutarse en el hardware del navegador.
- Opciones de despliegue: servidor web estatico o CDN para servir los archivos ONNX; el codigo cliente usa ONNX Runtime Web.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El unico comparable directo es el ProteinMPNN original de Dauparas et al., del cual este repositorio es un port para navegador. En la informacion disponible no se incluyen datos de benchmarks ni parametros para comparar con otras alternativas.

| Modelo | Descripcion | Parametros | Licencia | Formato |
|---|---|---|---|---|
| MurrellLab/webports | Port de ProteinMPNN a ONNX para navegador | no disponible | MIT | ONNX |
| ProteinMPNN original | Modelo de diseno de secuencias proteicas (Science, 2022) | no disponible | MIT | pesos originales |

Otras alternativas de diseno de proteinas (ESM-IF1, RFdiffusion) existen, pero no estan caracterizadas en la informacion disponible.

## Limitaciones y advertencias

- Los bundles preservan el comportamiento y las limitaciones del checkpoint upstream de ProteinMPNN; la conversion no constituye nuevo entrenamiento ni validacion biologica.
- Las secuencias generadas requieren evaluacion computacional y experimental independiente antes de cualquier uso practico.
- No es una API de inferencia alojada; el usuario debe servir los archivos y gestionar el renderizado de ONNX Runtime Web.
- No es adecuado para toma de decisiones clinicas.
- Requiere un navegador compatible con WebAssembly o WebGPU.
- No se han publicado benchmarks de rendimiento en la informacion proporcionada.
- Los modelos de diseno de proteinas no estan sometidos a procesos de alineamiento ni de seguridad de modelos de lenguaje; la salida debe interpretarse en el contexto de la biologia computacional.

## Enlaces

- HuggingFace: https://huggingface.co/MurrellLab/webports
- Repositorio del proyecto: https://github.com/MurrellGroup/webProteinMPNN
- Articulo original de ProteinMPNN: https://doi.org/10.1126/science.add2187
- Perfil de MurrellLab en HuggingFace: https://huggingface.co/MurrellLab
