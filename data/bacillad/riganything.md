# bacillad/RigAnything

## Resumen

RigAnything es un modelo de investigación publicado en ACM Transactions on Graphics (SIGGRAPH TOG 2025) que aborda el problema del auto-rigging de activos 3D: la generación automática de esqueletos (joints) y pesos de skinning para mallas 3D arbitrarias sin depender de una plantilla predefinida. A diferencia de aproximaciones clásicas que asumen topologías humanoides o cuadrúpedas, el modelo predice la estructura esquelética de forma autorregresiva, lo que le permite manejar activos diversos como dragones, criaturas fantásticas u objetos articulados.

El modelo lo desarrollan Isabella Liu, Zhan Xu, Yifan Wang, Hao Tan, Zexiang Xu, Xiaolong Wang, Hao Su y Zifan Shi, y se distribuye a través de Hugging Face (repositorio `bacillad/RigAnything`, con checkpoint alternativo en `Isabellaliu/RigAnything`). El repositorio ocupa 2,3 GB e incluye scripts de inferencia que aceptan mallas en formato `.glb` o `.obj` y exportan un GLB ya riggeado, listo para importar en herramientas DCC como Blender.

Su relevancia actual reside en que automatiza una tarea tradicionalmente manual y costosa en pipelines de animación y videojuegos, y lo hace sin restringirse a una plantilla fija. No es un modelo de lenguaje: es un modelo generativo específico para gráficos 3D, por lo que sus "capacidades" y "benchmarks" deben interpretarse en ese dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generativa autorregresiva para predicción de esqueletos y skinning (detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa lenguaje natural como tarea principal) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`); entrada `.glb` y `.obj`; salida `.glb` y `.npz` |

## Arquitectura y entrenamiento

La información disponible indica que RigAnything es un modelo autorregresivo y "template-free" para rigging de activos 3D diversos. El enfoque predice de forma secuencial la estructura del esqueleto (conjuntos de joints) y, a partir de ella, los pesos de skinning asociados a la malla de entrada. El paper se publica en ACM Transactions on Graphics, volumen 44, número 4, páginas 1-12, año 2025, lo que sitúa el trabajo en el circuito de gráficos por computador de SIGGRAPH.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas más allá de la naturaleza autorregresiva y libre de plantilla del método. Cualquier afirmación adicional sobre la arquitectura interna (tipo de transformer, mecanismo de atención, etc.) no está respaldada por los datos disponibles.

## Capacidades

- Predicción de esqueletos (joints) para mallas 3D arbitrarias sin plantilla fija.
- Generación de pesos de skinning asociados al esqueleto predicho.
- Procesamiento de activos 3D diversos (criaturas, objetos articulados, personajes no humanoides).
- Entrada en `.glb` y `.obj` (conversión interna de `.obj` a `.glb` sin texturas).
- Salida de malla riggeada en `.glb` importable en Blender y otras herramientas DCC.
- Simplificación opcional de malla antes de la inferencia, con control del número objetivo de caras.
- Exportación de resultados intermedios en `.npz` (joints, pesos, etc.) para inspección o post-proceso.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso en el sentido de los LLM; su ámbito es exclusivamente el rigging 3D.

## Casos de uso

- **Pipeline de animación en videojuegos**: riggear automáticamente assets de criaturas y personajes no humanoides generados por artistas o por modelos generativos 3D, reduciendo el trabajo manual de creación de esqueletos y pesos de skinning antes de la fase de animación.
- **Previsualización rápida en producción**: dado un `.glb` de bloqueo, ejecutar la inferencia para obtener un esqueleto preliminar y validar la articulación del asset antes de invertir tiempo en un rig definitivo.
- **Integración en Blender**: importar el `<name>_simplified_rig.glb` exportado por el script en Blender para continuar el trabajo de animación, ajuste de pesos o retargeting.
- **Generación de assets para realidad aumentada/virtual**: riggear modelos ligeros (previa simplificación a un número de caras objetivo) para su uso en aplicaciones interactivas con presupuesto de rendimiento limitado.
- **Investigación en gráficos generativos**: usar el checkpoint y los scripts de inferencia como base para experimentos de auto-rigging, comparación de métodos o extensión del enfoque autorregresivo a nuevos dominios de activos.
- **Automatización de catálogos 3D**: procesar por lotes mallas `.obj`/`.glb` de una biblioteca de assets y producir versiones riggeadas de forma desatendida en servidores headless, usando el wheel de `bpy` y un contexto off-screen (OSMesa/Xvfb).
- **Prototipado de personajes fantásticos**: riggear dragones u otras criaturas (el ejemplo del repositorio es `spyro_the_dragon.glb`) que no encajan en plantillas humanoides estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma numérica. El repositorio indica que la inferencia usa la primera GPU CUDA (`cuda:0`) y recomienda simplificar la malla (mayor ratio de simplificación o menor número de caras) si la memoria es insuficiente.
- **GPU recomendadas**: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información proporcionada. Se asume una GPU CUDA compatible con la versión de PyTorch instalada (el ejemplo usa `cu126`).
- **Consumer GPU**: no se confirma ni se descarta; depende del tamaño real del checkpoint (repo de 2,3 GB) y de la malla de entrada.
- **Opciones de despliegue**: scripts de inferencia propios (`scripts/inference.sh`, `inference.py`, `inference_utils/mesh_simplify.py`, `inference_utils/vis_skel.py`) sobre PyTorch; requiere `bpy` (wheel de PyPI o Blender del sistema), `open3d` y `pymeshlab`, que pueden necesitar librerías GL del sistema (`libgl1`).
- **Latencia y throughput**: no disponibles.
- **Entorno**: Python 3.11 en un entorno Conda limpio; en servidores headless se recomienda OSMesa/Xvfb y asegurar `libGL`.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables (parámetros, contexto, rendimiento, licencia) para establecer una comparativa cuantitativa. La categoría sería la de métodos de auto-rigging 3D, pero no se han incluido alternativas concretas en la documentación disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RigAnything | no disponible | no aplica | no disponible | no disponible | Hugging Face (repo `bacillad/RigAnything`, checkpoint `Isabellaliu/RigAnything`) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no declara licencia, lo que impide confirmar si el uso comercial está permitido; es un riesgo relevante para producción.
- **Modelo de investigación**: el repositorio está orientado a inferencia y reproducción del paper; no se documenta soporte, SLA ni mantenimiento.
- **Dependencias frágiles**: requiere `bpy`, `open3d` y `pymeshlab`, con posibles problemas de OpenGL/GLX en servidores; la configuración headless puede necesitar OSMesa/Xvfb y librerías del sistema.
- **Memoria GPU**: la inferencia usa `cuda:0` y puede agotar VRAM con mallas de alta densidad; la simplificación previa es el mecanismo recomendado para mitigarlo.
- **Conversión de `.obj`**: se realiza a `.glb` internamente y sin texturas, lo que puede perder información visual del activo original.
- **Sesgos y alucinación**: no hay información sobre sesgos del dataset ni sobre tasas de error del rigging; al ser un modelo generativo 3D, pueden producirse esqueletos o pesos de skinning incorrectos que requieran revisión manual.
- **Idioma**: la etiqueta `en` no implica procesamiento de lenguaje natural; el modelo no es un LLM y no debe evaluarse como tal.
- **Fecha del repositorio**: la fecha de creación indicada (2026-11-18) resulta anómala respecto al paper (2025); conviene verificar la procedencia y autenticidad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face (repo): https://huggingface.co/bacillad/RigAnything
- Hugging Face (checkpoint del autor): https://huggingface.co/Isabellaliu/RigAnything/tree/main
- Paper (arXiv): https://arxiv.org/abs/2502.09615
- Página del proyecto: https://www.liuisabella.com/RigAnything/
- Repositorio GitHub: https://github.com/Isabella98Liu/RigAnything
