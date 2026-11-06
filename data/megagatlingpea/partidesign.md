# MegaGatlingPea/PartiDesign

## Resumen

PartiDesign es un modelo de co-diseño estructura-secuencia para el diseño molecular, desarrollado por el autor independiente MegaGatlingPea. El repositorio de Hugging Face `MegaGatlingPea/PartiDesign` distribuye únicamente los pesos originales de dos componentes: PartiDesign (generación molecular) y PartiScore (puntuación de interfaces moleculares). Según el artículo de bioRxiv asociado, el modelo extiende el marco de trabajo parcialmente latente de La-Proteina para cubrir proteínas, ácidos nucleicos y moléculas pequeñas de forma unificada. El problema que aborda es el acoplamiento entre la generación de estructura tridimensional y el diseño de secuencia o identidad química en sistemas químicamente diversos.

El paquete publicado es exclusivamente de pesos: no incluye código de inferencia, servicio, entorno ni conjuntos de datos. El código de despliegue correspondiente permanece sin confirmar en la rama principal del repositorio oficial de GitHub, por lo que la ejecución requiere el checkout de código fuente compatible (PartiDesign 0.1.0) y la preparación separada de los pesos de modelos auxiliares (ESMFold2, AF2-IG, AF3, Mol-1).

El checkpoint de generación ocupa 4,9 GB (4.909.825.762 bytes) y el de puntuación 25,4 MB (25.350.931 bytes). No se han publicado especificaciones de arquitectura, número de parámetros, longitud de contexto ni idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (marco parcialmente latente heredado de La-Proteina, según el artículo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen checkpoints binarios sin conversión) |
| Idiomas soportados | no disponible (modelo orientado a moléculas, no a texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ckpt` binario (PyTorch); sin safetensors ni GGUF |
| Tamaño del repo | 4,9 GB |
| Checkpoints | `ckpts/partidesign.ckpt` (4.909.825.762 bytes), `ckpts/partiscore.ckpt` (25.350.931 bytes) |
| Framework | PyTorch 2.9.1+cu128 (CUDA 12) o 2.11.0+cu130 (CUDA 13) |
| Python | 3.12.6 |
| Dependencias nativas | OpenMM 8.4.0, openmmforcefields 0.15.1, cuEquivariance 0.10.0 / 0.13.0, JAX 0.10.2 |

## Arquitectura y entrenamiento

Según el artículo de bioRxiv, PartiDesign es un modelo unificado de co-diseño estructura-secuencia que extiende el marco parcialmente latente de La-Proteina a proteínas, ácidos nucleicos y moléculas pequeñas. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El repositorio incluye dos módulos diferenciados: un generador (PartiDesign) y un puntuador de interfaces (PartiScore), este último de tamaño muy reducido (25 MB) y orientado a evaluar complejos moleculares.

La innovación técnica destacable es la unificación de espacios químicos diversos bajo un mismo paradigma de co-diseño. El pipeline de despliegue documentado emplea ESMFold2-fast para iteración y ESMFold2-standard (con cinco muestras) para validación final, con un preset explícito de PPI basado en AF2-IG. AF3 y Mol-1 son opcionales. Los pesos de estos modelos auxiliares no se incluyen en el paquete y deben prepararse por separado. No se dispone de información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de estructuras y secuencias moleculares de forma conjunta (co-diseño estructura-secuencia).
- Cobertura de proteínas, ácidos nucleicos y moléculas pequeñas en un mismo marco.
- Puntuación de interfaces moleculares mediante PartiScore sobre ficheros PDB/CIF.
- Definición de tareas, restricciones y muestreo mediante ficheros YAML.
- Integración con modelos de plegamiento para validación (ESMFold2-fast, ESMFold2-standard, AF2-IG, AF3, Mol-1 opcionales).
- Ejecución en CPU para la tarea de scoring (`--device cpu`).
- No se documentan capacidades de tool calling, agentes, texto, visión ni audio.

## Casos de uso

- Diseño de proteínas de novo: el comando `partidesign design` con un YAML de tarea permite generar estructuras y secuencias con restricciones definidas por el usuario, adecuado para pipelines de diseño computacional de proteínas.
- Diseño de complejos proteína-proteína: el preset PPI con AF2-IG (un par complejo/monómero) permite generar y validar interfaces de unión en flujos de descubrimiento de interacciones.
- Diseño de ácidos nucleicos: el marco unificado cubre ácidos nucleicos, útil para generar candidatos de aptámeros o estructuras de ARN con identidad química definida.
- Diseño de moléculas pequeñas: la extensión del marco a moléculas pequeñas permite generar ligandos con estructura y química acopladas, aplicable en descubrimiento temprano de fármacos.
- Puntuación de interfaces en cribado: `partidesign score` sobre un directorio de complejos PDB/CIF permite filtrar candidatos por calidad de interfaz; los monómeros sin pareja de contacto elegible no reciben puntuación de interfaz.
- Validación con plegamiento: el pipeline por defecto usa ESMFold2-standard con cinco muestras para validación final de los diseños generados, integrándose en flujos de control de calidad estructural.
- Replicación de experimentos: los SHA256 publicados y las revisiones inmutables de Hugging Face permiten reproducir exactamente los pesos empleados en un experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint de generación ocupa 4,9 GB en disco; la VRAM necesaria no se documenta.
- GPU validadas: RTX 4080 SUPER (host de verificación de despliegue en entornos Conda CUDA 12/13 y uv CUDA 12/13).
- No se documentan pruebas en A100, H100 ni otras GPU de centro de datos.
- Compatibilidad consumer: sí, verificado en RTX 4080 SUPER; no se confirman otros modelos.
- Despliegue: instalación mediante `install.sh` con uv (por defecto, CUDA 12) o Conda/Mamba; se requieren tanto uv como un prefijo Conda nativo emparejado. Perfiles CUDA 12 y CUDA 13 en entornos virtuales separados e incompatibles entre sí.
- Scoring en CPU: soportado mediante `--device cpu`.
- Latencia y throughput: no disponibles. Se documentan 48 comandos reales de pipeline ejecutados con éxito en la verificación de despliegue.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PartiDesign | Co-diseño estructura-secuencia (proteínas, ácidos nucleicos, moléculas pequeñas) | no disponible | no disponible | Apache-2.0 | Pesos en HF; código en GitHub |
| La-Proteina | Co-diseño estructura-secuencia (proteínas) | no disponible | no disponible | no disponible | Referencia base del marco parcialmente latente |
| ESMFold2 | Predicción de estructura | no disponible | no disponible | no disponible | Modelo auxiliar requerido, no incluido en el paquete |
| AF2-IG | Predicción de estructura de complejos | no disponible | no disponible | no disponible | Modelo auxiliar opcional para el preset PPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El paquete contiene solo pesos: sin código de inferencia, entorno ni datasets; el código de despliegue permanece sin confirmar en la rama principal del repositorio oficial.
- Los pesos auxiliares (ESMFold2, AF2-IG, AF3, Mol-1) no se incluyen y deben prepararse por separado; el pipeline por defecto depende de ESMFold2.
- PartiScore requiere parejas de contacto elegibles; un monómero sin interfaz no recibe puntuación de interfaz.
- Los entornos CUDA 12 y CUDA 13 no deben combinarse; cada par uv/prefijo nativo debe mantenerse intacto.
- El uso de nombres de rama mutables de Hugging Face no garantiza reproducibilidad; debe usarse un hash de commit inmutable.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas (el modelo no opera sobre texto).
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de código de despliegue publicado y de especificaciones de arquitectura limita la evaluación independiente.
- En la verificación de despliegue, cuatro tareas ordinarias se eliminaron en la ronda 1 bajo los umbrales originales, dejando etapas posteriores sin ejecutar en esas pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MegaGatlingPea/PartiDesign
- Repositorio oficial en GitHub: https://github.com/MegaGatlingPea/PartiDesign-official
- Artículo en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.11.03.763860v1
- Guía de entornos: https://github.com/MegaGatlingPea/PartiDesign-official/blob/main/docs/environments.md
- Guía de diseño: https://github.com/MegaGatlingPea/PartiDesign-official/blob/main/docs/design.md
- Guía de scoring: https://github.com/MegaGatlingPea/PartiDesign-official/blob/main/docs/score.md
