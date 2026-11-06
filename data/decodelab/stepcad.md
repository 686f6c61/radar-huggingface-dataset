# DeCoDELab/StepCAD

## Resumen

StepCAD es un modelo desarrollado por DeCoDELab, vinculado al paper "StepCAD: Mesh-to-CAD Code Generation via LLM Policy and Geometry-Guided Search", cuyo objetivo es convertir mallas 3D (point clouds o ficheros STL) en codigo CAD ejecutable, presumiblemente en CadQuery, mediante una politica basada en un modelo de lenguaje y una busqueda guiada por geometria. El repositorio incluye dos componentes: un codificador de nubes de puntos con su proyector (`encoders.pt`) y una politica de lenguaje en formato Hugging Face (`llm/`) pensada para servirse con vLLM.

El modelo aborda el problema de la ingenieria inversa y la reconstruccion parametrica de piezas: a partir de una geometria 3D observada, generar el codigo de scripting que reproduzca la pieza de forma editable, en lugar de producir directamente una malla. Se trata de un modelo especializado y de nicho, no de un LLM de proposito general, y su relevancia actual reside en la interseccion entre generacion de codigo y diseno asistido por computador.

La informacion disponible es escasa: la model card es minima y no detalla parametros, contexto, datos de entrenamiento ni resultados de benchmarks. El repositorio ocupa 3,3 GB, lo que sugiere un modelo de lenguaje de escala moderada junto con el codificador multimodal, aunque el dato exacto de parametros no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codificador de nubes de puntos + proyector + politica LLM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo), `encoders.pt` (PyTorch) y `llm/` en formato Hugging Face |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de nubes de puntos con un proyector que mapea las representaciones geometricas al espacio de un modelo de lenguaje, que actua como politica para generar codigo CAD (CadQuery). El pipeline descrito en el paper incorpora una "geometry-guided search", es decir, una busqueda que usa la geometria objetivo para guiar o filtrar las hipoteses de codigo generadas. El repositorio separa explicitamente el codificador (`encoders.pt`) del LLM (`llm/`), lo que confirma una arquitectura multimodal punto-nube-a-texto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron RLHF, DPO u otras etapas de ajuste. La innovacion tecnica destacable es el uso de busqueda guiada por geometria sobre la salida del LLM para mejorar la fidelidad de la reconstruccion CAD, y el hecho de que la politica se sirve con vLLM sugiere un diseno orientado al despliegue eficiente.

## Capacidades

- Generacion de codigo CAD (CadQuery) a partir de mallas 3D o nubes de puntos.
- Conversion mesh-to-CAD con reconstruccion parametrica editable.
- Procesamiento de geometria 3D mediante codificador de nubes de puntos.
- Busqueda guiada por geometria para seleccionar o refinar candidatos de codigo.
- Servicio de la politica de lenguaje mediante vLLM.
- Tool calling, agentes, vision 2D, audio y modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Ingenieria inversa de piezas: a partir de un escaneo 3D o un STL existente, generar el script CadQuery que reproduce la pieza de forma parametrica y editable, en lugar de una malla fija.
- Digitalizacion de catalogo de componentes: convertir mallas heredadas de bibliotecas de piezas en codigo CAD reutilizable y versionable en un repositorio.
- Integracion en pipelines de diseno generativo: usar la politica servida con vLLM para producir candidatos de codigo CAD y filtrarlos con la busqueda guiada por geometria antes de validarlos.
- Automatizacion de prototipado: generar scripts CAD a partir de capturas de objetos fisicos para acelerar iteraciones de diseno mecanico.
- Herramientas de reparacion y refactorizacion de modelos 3D: obtener codigo parametrico que permita modificar dimensiones o restricciones sobre una geometria dada.
- Investigacion en generacion de codigo multimodal: banco de pruebas para estudiar la conexion entre representaciones geometricas y generacion de codigo ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (3,3 GB) orienta el orden de magnitud, pero no se detalla el reparto entre codificador y LLM.
- GPU recomendadas: no disponible. El uso de vLLM sugiere GPUs con memoria suficiente para el LLM en formato Hugging Face (por ejemplo, A100, H100 o RTX con VRAM adecuada), pero no se confirman modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM para la politica de lenguaje; el codificador se carga con PyTorch (`encoders.pt`). El repositorio de codigo incluye `infer.py` con descarga automatica de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de mesh-to-CAD basados en LLM con datos de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta parametros, contexto, datos de entrenamiento ni evaluacion, lo que dificulta validar su calidad antes de usarlo en produccion.
- Riesgo de alucinacion en la generacion de codigo: el codigo CadQuery producido puede no compilar o no reproducir fielmente la geometria objetivo; la busqueda guiada por geometria mitiga pero no garantiza este riesgo.
- Dependencia del codificador de nubes de puntos: la calidad de la salida esta condicionada por la calidad y el formato de la malla de entrada.
- Sin datos sobre sesgos, cobertura de idiomas ni robustez ante geometrias atipicas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del codigo asociado (`stepcad-v1`) y de CadQuery.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/DeCoDELab/StepCAD
- Paper: https://arxiv.org/pdf/2610.03799
- Codigo: https://github.com/ghadinehme/stepcad-v1
