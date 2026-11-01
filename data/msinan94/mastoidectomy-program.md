# msinan94/mastoidectomy-program

## Resumen

`msinan94/mastoidectomy-program` no es un modelo de lenguaje ni un modelo de IA entrenado, sino un repositorio de código que sirve como andamiaje (scaffold) para un programa de investigación en cirugía robótica asistida por ordenador: la mastoidectomía, un procedimiento otológico en el que se perfora el hueso temporal para acceder al oído medio. El repositorio lo publica el usuario msinan94 en Hugging Face y se presenta explícitamente como una "exploration phase (P0)", es decir, una fase inicial en la que todavía no hay ningún modelo entrenado y el trabajo se limita a la adquisición y verificación de conjuntos de datos.

La arquitectura propuesta, descrita en el fichero `ROADMAP.md` (versión 0.2), sigue una cadena de percepción → planificación → gemelo digital (digital twin) → control, con una línea transversal de evaluación. En el momento de la publicación, el único componente funcional es un script de verificación (`scripts/verify_openear.py`) que descarga huesos temporales del dataset OpenEar alojado en Zenodo y comprueba su integridad mediante el md5 publicado en el registro original.

Su relevancia actual es, por tanto, documental y metodológica: fija fuentes de datos con licencias compatibles (OpenEar y DIOME, ambas CC-BY-4.0), anclas de precisión tomadas de la literatura clínica (HEARO y el robot de fresado de Vanderbilt) y una hoja de ruta por fases para quien quiera reproducir o continuar el proyecto. No debe confundirse con un modelo listo para inferencia ni con un producto clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio de código (scaffold) para un pipeline de percepción, planificación, gemelo digital y control robótico; no es un modelo neuronal |
| Parametros totales | no disponible (no hay modelo entrenado; P0 es adquisición de datos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (documentación en inglés) |
| Licencia | no disponible (la model card no declara licencia para el repositorio; los datasets de origen son CC-BY-4.0 y el código de W-Net es GPL-3.0) |
| Formato de pesos | no disponible (no hay pesos; el único artefacto ejecutable es un script de Python) |

## Arquitectura y entrenamiento

El repositorio describe conceptualmente una arquitectura en capas para un sistema de mastoidectomía autónoma o de control compartido: percepción (segmentación de estructuras del hueso temporal a partir de TC convencional y CBCT), planificación de trayectorias, gemelo digital para simulación y control del robot de fresado, más una capa transversal de evaluación. La model card remite a `ROADMAP.md` v0.2 para el detalle de capas, anclas de precisión, puerta de viabilidad (feasibility gate) y plan por fases.

No se ha entrenado nada. La fase P0 se limita a la adquisición y verificación de datos. Las fuentes previstas son OpenEar (8 huesos temporales con CBCT registrada a 125 µm, microcortes en color y anotaciones de nervios y vasos, en Zenodo, CC-BY-4.0), DIOME (43 volúmenes OCT de oído medio in vivo con segmentaciones fusionadas por STAPLE, en OPARA, CC-BY-4.0), el dataset del repositorio W-Net para segmentación en TC convencional (código GPL-3.0) y el pipeline nnU-Net v2 de la Universidad Johns Hopkins con pesos preentrenados para segmentación de hueso temporal. No se especifican número de tokens, composición de dataset de entrenamiento, ni técnicas de RLHF o DPO, porque no hay fase de entrenamiento.

Como anclas de precisión se citan dos referencias clínicas: HEARO, con 0,182 mm en el punto objetivo, 0,117 mm en el nervio facial y 0,107 mm en la cuerda del tímpano, y el robot de fresado anclado al hueso de Vanderbilt, con 0,39 mm de error medio en el borde de la cavidad en cadáver.

## Capacidades

- No hay capacidades de inferencia: el repositorio no contiene pesos ni un modelo ejecutable.
- Verificación de integridad de datos: `scripts/verify_openear.py` descarga un hueso del dataset OpenEar desde Zenodo (por ejemplo, ZETA, unos 3,9 GB) y comprueba el md5 contra el publicado en el registro de Zenodo, consultado en tiempo de ejecución sin valores incrustados.
- Modo de solo comprobación (`--list-only`): enumera los 8 ficheros con sus tamaños y md5 publicados sin descargar nada.
- Hoja de ruta documentada: `ROADMAP.md` v0.2 con arquitectura por capas, anclas de precisión, puerta de viabilidad y plan por fases.
- Atribución explícita: obligaciones de crédito para OpenEar (Sieber et al., Scientific Data 6:180297, 2019) y para los activos SimReady de NVIDIA y Franka Robotics cuando se incorporen a árboles públicos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, porque no es un modelo generativo.

## Casos de uso

- Reproducción de la fase P0: un equipo que quiera arrancar el proyecto puede ejecutar `verify_openear.py` para descargar y validar los huesos temporales de OpenEar antes de montar su propio pipeline de segmentación, evitando corrupción silenciosa de datos.
- Auditoría de integridad de datasets médicos: el patrón de verificar md5 contra la API de Zenodo en tiempo de ejecución sirve como plantilla para otros conjuntos de imágenes médicas con checksums publicados.
- Punto de partida para segmentación de hueso temporal: combinando los pesos preentrenados de nnU-Net v2 del repositorio de JHU con las anotaciones de OpenEar y W-Net, un grupo de investigación puede entrenar un segmentador de estructuras óseas y nerviosas.
- Simulación de fresado y gemelo digital: la hoja de ruta define la capa de gemelo digital, útil para validar trayectorias de fresado en simulación antes de cualquier prueba física, sin reclamaciones clínicas.
- Planificación quirúrgica asistida: las anclas de precisión de HEARO y Vanderbilt permiten fijar umbrales de error objetivo (submilimétricos) al diseñar un sistema de control compartido.
- Docencia e ingeniería de sistemas robóticos médicos: el repositorio sirve como caso de estudio de una arquitectura percepción-planificación-control con lane de evaluación transversal, útil en cursos de robótica quirúrgica.
- Integración de datos multimodal: la combinación de CBCT, microcortes en color y OCT in vivo (DIOME) permite experimentar con registro y fusión multimodal en un dominio anatómico concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene ningún modelo entrenado ni métricas de evaluación propias; las únicas cifras citadas son anclas de precisión de sistemas clínicos de terceros, no resultados de este proyecto.

| Referencia externa | Métrica | Valor |
|---|---|---|
| HEARO (clínico, trayectoria de túnel único) | Error en el punto objetivo | 0,182 mm |
| HEARO | Error en nervio facial | 0,117 mm |
| HEARO | Error en cuerda del tímpano | 0,107 mm |
| Robot de fresado anclado al hueso de Vanderbilt (cadáver) | Error medio en el borde de la cavidad | 0,39 mm |

## Requisitos de hardware

- No hay modelo que ejecutar, por lo que no aplican requisitos de VRAM para inferencia.
- El script de verificación es ligero en cómputo, pero requiere ancho de banda y almacenamiento: la descarga de un solo hueso OpenEar (ZETA) ocupa aproximadamente 3,9 GB, y el dataset completo son 8 huesos.
- Para las fases posteriores (segmentación con nnU-Net v2 y entrenamiento de modelos de percepción) se necesitarán GPU con memoria suficiente para volúmenes 3D médicos; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: no aplica (no hay servidor de inferencia, ni soporte de vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada proyectos comparables de la misma categoría (scaffolds de investigación para mastoidectomía robótica) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no infiere y no puede usarse para generar texto, código ni predicciones.
- Estado P0: nada está entrenado; la fase actual es solo adquisición y verificación de datos.
- Sin licencia declarada para el repositorio, lo que impide determinar condiciones de uso comercial o de redistribución del propio código.
- Dependencia de licencias de terceros: OpenEar y DIOME son CC-BY-4.0 (requieren atribución) y el código de W-Net es GPL-3.0, lo que puede condicionar la combinación con código propietario.
- Dependencia de disponibilidad externa: los datasets se alojan en Zenodo y OPARA, no en Hugging Face; la model card indica que no existen réplicas en el Hub (comprobado el 2026-11-01), por lo que la disponibilidad depende de los hosts primarios.
- Riesgo de integridad de datos: el script mitiga la corrupción de descargas, pero no valida la calidad anatómica ni la corrección de las anotaciones.
- Sin validación clínica: el propio repositorio declara "simulation and engineering only. No clinical claims"; no debe usarse en decisiones clínicas.
- Sesgos y alucinación: no aplica en el sentido habitual de modelos generativos, pero los datos de origen (8 huesos temporales, 43 volúmenes OCT) son de tamaño reducido y pueden no representar la variabilidad anatómica poblacional.
- Idiomas: la documentación está en inglés; no hay soporte multilingüe declarado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/msinan94/mastoidectomy-program
- Dataset OpenEar en Zenodo: https://zenodo.org/records/1473724
- DOI de OpenEar: https://doi.org/10.5281/zenodo.1473724
- Dataset DIOME en OPARA: https://doi.org/10.25532/OPARA-279
- Repositorio W-Net (segmentación de estructuras del hueso temporal en TC): https://github.com/Dnkii/Automatic-Segmentation-of-Temporal-Bone-Structures-from-Clinical-Conventional-CT
- Pipeline nnU-Net v2 de JHU (pesos preentrenados de segmentación de hueso temporal): https://github.com/andy-s-ding/tbone-seg-nnunetv2
- Referencia HEARO (PMC8979022): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8979022/
- Referencia robot de fresado Vanderbilt (PMC4547504): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4547504/
- Sieber et al., Scientific Data 6:180297 (2019): https://doi.org/10.1038/sdata.2018.297
