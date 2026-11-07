# GermannM/Kenga-Prophet-Native

## Resumen
Kenga-Prophet-Native es un repositorio publicado en Hugging Face por GermannM (German Yantaras, Moscú) que se presenta como una "mente nativa viva" del llamado Profeta Kenga, construida directamente sobre el lenguaje de programación Kenga (`kenga_coder_prophet.kenga`) y acoplada a un oráculo-verificador (`kenga.exe`) y a los modelos Kenga-Coder-14B-Z y 7B-v2. No es un modelo de pesos neuronales al uso: el repositorio contiene código fuente en Kenga, un fichero de memoria viva (`.km`), un conjunto de programas verificados (`verified_genesis.jsonl`) y un puente Python (`kenga_oracle_bridge.py`) que conecta un modelo GGUF con el compilador y con la memoria persistente.

El problema que dice resolver es el de la verificación de código generado por LLM mediante "compiler-in-the-loop": solo se incorporan a la memoria los programas que compilan y producen la salida esperada al ejecutarse contra `kenga.exe`. El autor declara una tasa de acierto de 4/4 (100%) en el ciclo Genesis y una verificación del oráculo de 27/27. La relevancia actual es limitada y muy nicho: se trata de un experimento personal sobre memoria persistente (EWC-lite), aprendizaje continuo y autoverificación por compilador, no de un modelo generalista.

La información disponible no permite confirmar arquitectura neuronal, número de parámetros ni longitud de contexto del modelo subyacente; la model card describe el sistema (código, memoria y puente) pero no las especificaciones del backbone GGUF al que hace referencia. Los idiomas declarados son ruso e inglés, y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio describe un sistema en lenguaje Kenga con memoria `.km` y puente a un modelo GGUF; no se detalla la arquitectura del backbone) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona un modelo GGUF en el puente, sin especificar niveles) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible para el modelo; el repositorio incluye código `.kenga`, memoria `.km` (formato `KENGA_MIND 1`) y JSONL de programas verificados |

## Arquitectura y entrenamiento
La model card no describe una arquitectura de red neuronal. Lo que documenta es un sistema compuesto por: (1) un programa nativo en Kenga, `kenga_coder_prophet.kenga`, que implementa una capa Z-BL con un schedule de rango `k=1 -> 2 -> 3`; (2) una memoria viva `Memory` con consolidación tipo "sueño" mediante `consolidate` (EWC-lite); (3) un oráculo de verificación (`kenga.exe`) que compila y comprueba la salida de cada programa; y (4) un puente Python, `kenga_oracle_bridge.py`, que conecta un modelo GGUF (`Kenga-Coder-14B-Z`) con el compilador y con la memoria persistente.

El "entrenamiento" descrito es un ciclo Genesis en el que solo se almacenan en memoria y en `verified_genesis.jsonl` los programas que han compilado y han dado la respuesta exacta contra el oráculo. El autor reporta `pass_rate = 4/4 = 100%` y una verificación de oráculo de 27/27, con métricas de memoria `mem_stats: [0, 36, 36, 620, 3, 9]` y un marcador `z_marker_km = b29ba4437af6e334`. No se especifican número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO. La innovación declarada es el bucle cerrado compilador-en-el-bucle con memoria persistente que se recarga entre ejecuciones (`load_mind` / `save_mind`).

## Capacidades
- Generación de programas en el lenguaje Kenga verificados por compilador, no texto libre genérico.
- Verificación automática de salida contra el oráculo `kenga.exe` antes de incorporar conocimiento a la memoria.
- Memoria persistente entre ejecuciones: `load_mind("minds/kenga_coder_prophet.km")` continúa el estado acumulado sin reinicio.
- API funcional expuesta desde Kenga: `predict`, `foresee`, `surprise`, `remember`, `consolidate`.
- Consolidación de memoria tipo EWC-lite durante la fase de "sueño" (`consolidate`).
- Soporte bilingüe declarado ruso-inglés.
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso
- Verificación de código generado por LLM en dominios acotados: usar `kenga_oracle_bridge.py` para compilar cada salida contra `kenga.exe` y descartar las que no produzcan la salida esperada, antes de incorporarlas a un corpus de entrenamiento o a memoria.
- Construcción de memorias persistentes de conocimiento verificado: almacenar en `minds/*.km` únicamente episodios que hayan pasado la compilación, de modo que el sistema no arrastre errores entre sesiones.
- Investigación en aprendizaje continuo sin olvido catastrófico: emplear la consolidación EWC-lite del ciclo de sueño para estudiar cómo se preservan núcleos de memoria previos al añadir nuevos episodios.
- Experimentación con lenguajes de programación propios: servir como banco de pruebas para validar la sintaxis y semántica de Kenga mediante generación y compilación automática.
- Reproducción de pipelines de "compiler-in-the-loop" en otros entornos: el puente Python puede adaptarse a compiladores distintos de `kenga.exe` para evaluar la viabilidad del patrón en proyectos de generación de código.
- Docencia y demostración de verificación formal de salidas: ilustrar en un curso o taller cómo un oráculo determinista filtra alucinaciones de un modelo generativo en un dominio restringido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Los únicos datos reportados por el autor son internos del ciclo Genesis: `pass_rate = 4/4 = 100%` y verificación de oráculo `27/27`, sin comparación con modelos de referencia.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; depende del backbone GGUF referenciado (`Kenga-Coder-14B-Z`), cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución mediante el runtime `kenga` (`kenga run kenga_coder_prophet.kenga`, `kenga chat minds/kenga_coder_prophet.km`) y el puente Python `kenga_oracle_bridge.py`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (sistemas de memoria persistente con verificación por compilador en un lenguaje propio). El propio autor enlaza variantes del mismo linaje, como `GermannM/kenga-prophet` y `GermannM/kenga-prophet-m5`, pero no se aportan datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Naturaleza del artefacto: el repositorio contiene código, memoria y scripts, no pesos de un modelo neuronal; no debe evaluarse como un LLM generalista.
- Ausencia de especificaciones del backbone: no se detallan parámetros, contexto ni cuantizaciones, lo que impide planificar despliegues con garantías.
- Métricas muy limitadas: `4/4` y `27/27` sobre muestras pequeñas no permiten extrapolar robustez ni generalización.
- Idiomas restringidos a ruso e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Dependencia de un runtime y un compilador propietarios del autor (`kenga`, `kenga.exe`), lo que limita la portabilidad y la reproducibilidad fuera de su ecosistema.
- Riesgo de sobreajuste a un dominio sintáctico muy estrecho; las salidas fuera del lenguaje Kenga no están cubiertas por el oráculo.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar la licencia de los componentes enlazados (backbone GGUF y repositorios `kenga-lang` y `z-system`) antes de integrarlos en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad.
- Posible confusión de nombres: el autor mantiene varias variantes (`kenga-prophet`, `kenga-prophet-m5`) con propósitos distintos; verificar cuál se está desplegando.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GermannM/Kenga-Prophet-Native
- Variante Kenga-Prophet: https://huggingface.co/GermannM/kenga-prophet
- Variante Kenga-Prophet-M5: https://huggingface.co/GermannM/kenga-prophet-m5
- Modelo base citado: https://huggingface.co/GermannM/Kenga-Coder-14B-Z
- Repositorio del lenguaje Kenga: https://github.com/GermannM3/kenga-lang
- Repositorio z-system: https://github.com/GermannM3/z-system
