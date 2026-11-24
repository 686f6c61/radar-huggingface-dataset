# Maxfm15/gmgn-bullx-photon-copytrade-bot

## Resumen

La ficha solicitada corresponde al identificador `Maxfm15/gmgn-bullx-photon-copytrade-bot` alojado en Hugging Face. Tras revisar la información disponible, no se trata de un modelo de inteligencia artificial ni de un modelo de lenguaje: es un repositorio que distribuye un ejecutable para Windows (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`) empaquetado en un archivo ZIP de 4,8 MB protegido con contraseña. El contenido de la model card describe supuestas funciones de copytrading de criptomonedas (motor de bundles Jito/MEV, enrutado de órdenes, espejo de wallets, gestor de claves AES-256), no capacidades de inferencia.

No existe información sobre arquitectura de red neuronal, parámetros, tokenizador, contexto, dataset de entrenamiento ni pesos en formato safetensors o GGUF. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y los idiomas declarados (14 idiomas) son metadatos de distribución de software, no indicadores de capacidades lingüísticas de un modelo. El pipeline figura como no disponible.

Por tanto, esta ficha documenta lo que el repositorio declara y advierte de forma explícita de que no es evaluable como modelo de IA. Cualquier uso previsto para evaluación, despliegue o integración en pipelines de inferencia queda fuera del alcance real del artefacto publicado. Se recomienda precaución ante la discrepancia entre el nombre del repositorio, los enlaces de descarga (que apuntan a un repositorio de GitHub de terceros con nombre distinto) y el contenido anunciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red, datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO). El repositorio no contiene pesos de modelo ni código de inferencia. El contenido descrito en la model card corresponde a módulos de software de trading (motor de bundles Jito/MEV, sandbox de paper trading, enrutado de órdenes por WebSocket y gRPC, espejo de wallets, bundler de 20 wallets con Lookup Tables y almacén local de claves AES-256), presentados como funcionalidades de una aplicación de escritorio.

No hay evidencia de innovaciones técnicas propias de modelos generativos (atención lineal, decodificación especulativa, mezcla de expertos, modelos de estado recurrente) porque el artefacto no es un modelo de lenguaje. La información disponible no permite verificar los módulos anunciados ni su implementación.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling en el sentido de modelos de lenguaje.
- No se documenta razonamiento multi-paso ni comportamiento agéntico basado en LLM.
- Los idiomas listados son metadatos de la ficha, no capacidades lingüísticas verificadas.
- Según la model card, el ejecutable anunciaría funciones de copytrading: motor de bundles Jito/MEV, sandbox de paper trading, enrutado de órdenes, espejo de smart money, bundler de 20 wallets y almacén local de claves. Estas afirmaciones no están verificadas y no constituyen capacidades de un modelo de IA.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Evaluación de modelos de IA: no aplicable; el repositorio no contiene pesos ni código de inferencia, por lo que no puede usarse en bancos de pruebas de LLM.
- Despliegue en producción con vLLM, llama.cpp, TGI u Ollama: no aplicable; no hay artefacto de modelo compatible.
- Generación de código o asistencia al desarrollador: no aplicable; no hay modelo generativo.
- Investigación en arquitecturas transformer, MoE o SSM: no aplicable; no se publica arquitectura.
- Análisis de licencias y trazabilidad de artefactos: el repositorio sí puede estudiarse como caso de metadatos engañosos, ya que la licencia MIT declarada no aclara la procedencia del binario distribuido.
- Auditoría de seguridad: relevante para revisar la práctica de distribuir un `.exe` con contraseña en un ZIP alojado en un repositorio de GitHub de terceros, sin firmas ni hashes publicados en la información disponible.
- Automatización de trading de criptomonedas: la model card lo anuncia, pero no hay verificación independiente, ni código fuente auditable, ni resultados reproducibles en la información proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos de lenguaje, porque el artefacto no es un modelo evaluable de esa forma. Las cifras que aparecen en la model card (por ejemplo, 99,4 % de consistencia, sub-40 ms de enrutado, menos de 28 MB de RAM, 663K descargas) son afirmaciones del autor sin respaldo verificable en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput de inferencia: no disponibles.
- Requisitos del artefacto distribuido, según la model card: Windows 10 (22H2) o Windows 11 (24H2), arquitectura x64, archivo ZIP de 4,8 MB, contraseña de extracción `2026`, ejecución como administrador. No se especifican requisitos de CPU, RAM o disco más allá de la mención de menos de 28 MB de RAM en uno de los módulos.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo de lenguaje. Como referencia de la categoría de software anunciada (bots de copytrading), la información proporcionada no incluye alternativas verificables con parámetros, contexto, rendimiento o licencia comparables.

| Criterio | Este repositorio | Alternativa de modelo de IA | Alternativa de bot de trading |
|---|---|---|---|
| Naturaleza | Ejecutable Windows en ZIP | Modelo de lenguaje con pesos | Software de trading |
| Parámetros | no disponible | no aplicable | no aplicable |
| Contexto | no disponible | no aplicable | no aplicable |
| Licencia | MIT (declarada) | variable | variable |
| Verificación independiente | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración de arquitectura ni código de inferencia.
- La model card mezcla el nombre del repositorio (`gmgn-bullx-photon-copytrade-bot`) con enlaces de descarga a un repositorio de GitHub de terceros (`martina1713/monster-hunter-wilds-trainer-mod-2026`) y con un nombre de ejecutable que hace referencia a un trainer de otro producto. Esta inconsistencia impide verificar la procedencia del binario.
- La distribución de un `.exe` protegido con contraseña, sin firma digital ni hashes publicados en la información disponible, constituye un riesgo de seguridad para quien lo ejecute.
- Las capacidades anunciadas (bundles Jito/MEV, copytrading, gestor de claves) no están respaldadas por código auditable ni por resultados reproducibles en la información proporcionada.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no aplica a un modelo de lenguaje.
- La licencia MIT declarada afecta al repositorio, pero no aclara la licencia del binario de terceros ni de las dependencias que pueda incorporar.
- Uso comercial: la licencia MIT permitiría reutilización del contenido del repositorio, pero la falta de trazabilidad del ejecutable y las implicaciones regulatorias del trading de criptomonedas desaconsejan su uso en producción sin auditoría previa.
- Cualquier evaluación de este artefacto como modelo de IA debe concluir que no es apto para ello.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Maxfm15/gmgn-bullx-photon-copytrade-bot
- Repositorio de GitHub referenciado en la model card (descarga del ZIP): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en la model card (releases): https://github.com/SompongGarcia277/gmgn-bullx-photon-copytrade-bot/releases/latest
- Papers, blogs, demos o documentación técnica adicional: no disponible en la información proporcionada.
