# SJI381/subnautica-2-coop-trainer

## Resumen

`SJI381/subnautica-2-coop-trainer` es un repositorio alojado en Hugging Face que, pese a su ubicación y a su etiquetado con `pipeline_tag: other`, no contiene un modelo de inteligencia artificial. Se trata de una utilidad de tipo *trainer* (modificador de memoria o *cheat*) para el videojuego Subnautica 2 en modo cooperativo, distribuida como binario portable para Windows 10/11 x64 y publicada bajo licencia MIT. El autor es el usuario SJI381 y el repositorio no registra descargas ni interacciones en el momento de la consulta.

La ficha del repositorio describe una herramienta con *overlay* sobre DirectX 12 y Vulkan, configuración en JSON con recarga en caliente y un supuesto "desbloqueador de consola" de Unreal Engine 5. No existe información sobre arquitectura de red neuronal, parámetros, tokens de entrenamiento ni contexto, porque el artefacto no es un modelo lingüístico ni multimodal. Cualquier evaluación como modelo de IA resulta, por tanto, inaplicable.

La relevancia de esta ficha es fundamentalmente negativa: sirve para documentar un caso de contenido mal etiquetado en Hugging Face y para advertir a desarrolladores e investigadores de que el *pipeline* `other` puede albergar software que no guarda relación con el aprendizaje automático. Se recomienda no tratar este repositorio como un modelo y extremar las precauciones ante los enlaces de descarga que contiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como utilidad nativa x64 con overlay DX12/Vulkan) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh (etiquetas de localización del binario) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un archivo `.zip` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio describe un ejecutable portable de 64 bits para Windows 10 (22H2 o superior) y Windows 11 (23H2/24H2), con alineación de registros vectoriales AVX2, configuración JSON recargable en caliente (`config/settings.json`) y supuestos hooks sobre DirectX 12 y Vulkan 1.3. La model card menciona métricas de *frame pacing* y huella de memoria (del orden de 42-45 MB de RAM) medidas en equipos con RTX 4070, RTX 3060, RX 7800 XT e Intel Arc A770, pero no aporta metodología reproducible ni artefactos verificables.

No hay datos de tokens de entrenamiento, composición de dataset, RLHF, DPO ni ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.). El contenido de la model card mezcla instrucciones de instalación, enlaces a repositorios de GitHub de terceros y un archivo ZIP alojado en un repositorio ajeno al autor declarado, lo que constituye una señal de riesgo de seguridad más que una descripción técnica de un modelo.

## Capacidades

- No genera texto, código, matemáticas ni imágenes: no es un modelo generativo.
- No soporta *tool calling* ni *function calling* en el sentido de los LLM.
- No implementa agentes ni razonamiento multi-paso.
- La "capacidad multilingüe" se limita a la localización de la interfaz o de la documentación en 12 idiomas.
- Su función declarada es la modificación de memoria de un videojuego (Subnautica 2 en cooperativo) y el supuesto desbloqueo de consola de Unreal Engine 5.
- No dispone de modo *thinking*, visión, audio ni ninguna modalidad propia de un modelo de IA.

## Casos de uso

- Documentación de casos de mal etiquetado en Hugging Face: útil para estudiar cómo el *pipeline* `other` permite publicar binarios ajenos al ecosistema de IA y cómo detectarlos mediante inspección de la model card.
- Auditoría de seguridad de repositorios: sirve como ejemplo práctico para formar a equipos en la identificación de enlaces de descarga sospechosos (ZIP con contraseña, repositorios de GitHub no vinculados al autor) antes de ejecutar software.
- Evaluación de políticas de curación de datasets: permite ilustrar la necesidad de filtros automáticos que descarten repositorios sin pesos, sin arquitectura y sin benchmarks.
- Formación de revisores técnicos: caso de estudio sobre cómo una model card puede imitar el formato de una ficha de modelo (tablas de benchmarks, secciones de instalación) sin contener un modelo real.
- Pruebas de pipelines de catalogación: útil para verificar que un sistema de ingesta rechaza correctamente artefactos con `library_name: generic` y `pipeline_tag: other` que no son modelos.
- Análisis de riesgo de cadena de suministro: ejemplo de cómo un repositorio de Hugging Face puede redirigir a binarios alojados fuera de la plataforma, lo que dificulta la verificación de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de "runtime telemetry" con latencias de *frame pacing* (1,42 ms a 2,15 ms p99) y ganancias de FPS en cuatro configuraciones de hardware, pero no son benchmarks de un modelo de IA ni se acompañan de metodología verificable, por lo que no se reproducen aquí como resultados de rendimiento del modelo.

## Requisitos de hardware

- No aplica VRAM para inferencia de un modelo de IA: el artefacto es un binario nativo x64.
- La model card declara una huella de RAM de 42,4 a 45,2 MB según el perfil de hardware.
- Sistemas objetivo declarados: Windows 10 22H2 (Build 19045) y Windows 11 23H2/24H2 (Build 26100), x64, con AVX2.
- GPU mencionadas en la documentación del autor: NVIDIA RTX 4070, RTX 3060, AMD RX 7800 XT e Intel Arc A770; no se especifican requisitos mínimos reales.
- Opciones de despliegue propias de LLM (vLLM, llama.cpp, Ollama, TGI) no aplican.
- Latencia y throughput de inferencia: no disponibles (las cifras de la model card corresponden a *frame pacing* del juego, no a inferencia).

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada otras utilidades de la misma categoría publicadas en Hugging Face con las que establecer una comparación técnica fiable.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción de ML.
- La model card contiene enlaces de descarga a un ZIP alojado en un repositorio de GitHub de terceros (`pedrolong1343/nv-uefi-unlocker-vram-bios-suite`) distinto del autor declarado, con contraseña de extracción incluida; esto es un patrón habitual de distribución de software no verificado y potencialmente malicioso.
- Los repositorios de GitHub enlazados (`rinchao0721`, `paulamatsumoto3093`) no coinciden con el usuario de Hugging Face (`SJI381`), lo que impide atribuir autoría de forma fiable.
- El título del repositorio menciona "Unreal Engine 5 Console Unlocker" y "nv-uefi-unlocker-vram-bios-suite", términos que sugieren manipulación de firmware o BIOS y que no guardan relación con el nombre del repositorio.
- Las métricas de rendimiento declaradas no son reproducibles ni verificables con la información disponible.
- La licencia MIT se declara en los metadatos, pero su aplicabilidad al binario distribuido fuera de la plataforma no puede confirmarse.
- Riesgo de alucinación, sesgos y limitaciones de contexto: no aplicables por no ser un modelo lingüístico.
- Uso comercial: la licencia MIT permitiría teóricamente el uso comercial del contenido del repositorio, pero se desaconseja cualquier uso del binario sin auditoría de seguridad previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SJI381/subnautica-2-coop-trainer
- Repositorio GitHub citado como "Day-0": https://github.com/rinchao0721/subnautica-2-coop-trainer
- Repositorio GitHub citado como "Primary": https://github.com/paulamatsumoto3093/subnautica-2-coop-trainer
- Gateway `github.io` citado: https://paulamatsumoto3093.github.io/subnautica-2-coop-trainer/
- Documentación Go citada: https://pkg.go.dev/github.com/rinchao0721/subnautica-2-coop-trainer
- Notebook citado en nbviewer: https://nbviewer.org/github/rinchao0721/subnautica-2-coop-trainer/blob/main/notebooks/quickstart.ipynb
- Descarga ZIP citada (no verificada, no recomendada): https://github.com/pedrolong1343/nv-uefi-unlocker-vram-bios-suite/releases/download/v2.5.6/nv-uefi-unlocker-vram-bios-suite-v2.5.6-win64.zip
