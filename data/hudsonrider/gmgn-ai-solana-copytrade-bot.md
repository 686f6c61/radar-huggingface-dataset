# hudsonrider/gmgn-ai-solana-copytrade-bot

## Resumen

`hudsonrider/gmgn-ai-solana-copytrade-bot` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 (distribuido como archivo ZIP de 8,9 MB con contrasena de extraccion) que se presenta como un bot de copytrading para la red Solana. El autor lo etiqueta con `windows`, `windows-11`, `x64` y `portable`, y no declara pipeline, pesos ni arquitectura de red neuronal alguna.

La publicacion no incluye ningun tipo de artefacto propio de un modelo: no hay ficheros `safetensors`, `GGUF`, `ONNX` ni configuracion de transformer. La model card describe funcionalidades de trading (filtro de honeypots, take profit escalonado, enrutamiento de ordenes, sandbox de paper trading) y ofrece un enlace de descarga externo alojado en un repositorio de GitHub de terceros, junto con una contrasena para descomprimir el archivo.

Desde la perspectiva de evaluacion de modelos open source, este repositorio es irrelevante: no es un modelo, no es entrenable, no es desplegable en pipelines de inferencia y su distribucion como binario cerrado con contrasena constituye un patron habitual en campanas de malware. Se documenta aqui unicamente para dejar constancia de su naturaleza y advertir sobre los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no contiene checkpoints, tokenizador, configuracion de atencion, datos de preentrenamiento ni informacion sobre RLHF, DPO o ajuste fino. El contenido descrito en la model card corresponde a un ejecutable de Windows (`gmgn-ai-solana-copytrade-bot-v1.2.0-win64.exe`, build `v4.3.3`) empaquetado en un ZIP de 8,9 MB protegido con contrasena.

Las supuestas capacidades tecnicas mencionadas (enrutamiento de ordenes en menos de 40 ms, sondeo a 467 Hz, vault AES-256 local, 11 hilos de trabajo) no son verificables y no se acompanan de codigo fuente, hashes de integridad ni artefactos reproducibles. No hay publicacion cientifica ni documentacion tecnica que respalde estas afirmaciones.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingues declaradas en los metadatos no corresponden a competencia linguistica de un modelo, sino a etiquetas del repositorio.
- Las funcionalidades descritas en la model card (copytrading, filtro de honeypots, take profit escalonado) son afirmaciones del autor sobre un binario, no capacidades de un modelo verificable.

## Casos de uso

- **Ninguno en el ambito de IA open source.** El repositorio no es utilizable como modelo en pipelines de inferencia, generacion, clasificacion ni embedding.
- **Evaluacion de riesgos de cadena de suministro:** puede emplearse como caso de estudio de repositorios de Hugging Face que distribuyen binarios ejecutables con contrasena en lugar de pesos de modelo.
- **Formacion en deteccion de phishing:** util como ejemplo de model card que imita el formato de un proyecto legitimo (badges, tabla de caracteristicas, FAQ) para dirigir a descargas externas.
- **Auditoria de licencias:** el repo declara MIT pero el artefacto distribuido no incluye codigo fuente, lo que impide verificar el cumplimiento.
- **Analisis de seguridad de contenedores ZIP protegidos:** permite estudiar tecnicas de evasion basadas en archivos comprimidos con contrasena que dificultan el analisis automatico.
- **No se recomienda su ejecucion en ningun entorno**, ni de produccion ni de desarrollo, por el riesgo de compromiso del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no hay pesos que cargar.
- Requisitos reales del artefacto distribuido: sistema Windows x64 (10 u 11), 8,9 MB de disco para el ZIP y ejecucion como administrador segun las instrucciones del autor.
- Latencia y throughput: no disponibles ni verificables.

## Comparativa con modelos similares

No disponible. No existe categoria de modelo comparable porque el repositorio no contiene un modelo de IA. Frente a LLM open source reales (por ejemplo, familias Llama, Mistral, Qwen o Gemma), la comparacion carece de sentido: aquellos publican pesos, tokenizador, configuracion y resultados de evaluacion; este repositorio no publica ninguno de esos elementos.

## Limitaciones y advertencias

- **No es un modelo de IA:** el repositorio no contiene pesos, tokenizador ni configuracion de red neuronal.
- **Distribucion sospechosa:** binario `.exe` empaquetado en ZIP con contrasena (`2026`), alojado en un repositorio de GitHub de terceros ajeno a Hugging Face, practica habitual en campanas de malware.
- **Solicitud de privilegios elevados:** las instrucciones piden ejecutar como administrador, lo que amplia el impacto potencial de cualquier carga maliciosa.
- **Sin verificabilidad:** no hay codigo fuente, hashes publicados ni firmas del binario que permitan auditar su contenido.
- **Licencia MIT declarada pero no aplicable al artefacto:** al no distribuirse codigo fuente, no puede verificarse el cumplimiento de la licencia.
- **Riesgo financiero:** un supuesto bot de copytrading que solicita claves o acceso a wallets puede derivar en perdida de fondos; el modelo declara un "vault AES-256 local" no verificable.
- **Cero traccion:** 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que exista comunidad o reporte de incidentes.
- **Sesgos y alucinacion:** no aplica en el sentido de un LLM; el riesgo relevante es de seguridad, no de calidad de generacion.
- **Restricciones de contexto e idioma:** no aplica.
- **Recomendacion:** no descargar ni ejecutar el artefacto; reportar el repositorio a Hugging Face si se confirma que infringe sus politicas sobre distribucion de software ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hudsonrider/gmgn-ai-solana-copytrade-bot
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/pebble-grove/gmgn-ai-solana-copytrade-bot
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/pebble-grove/gmgn-ai-solana-copytrade-bot/releases/latest/download/gmgn-ai-solana-copytrade-bot-v1.2.0-win64.zip
