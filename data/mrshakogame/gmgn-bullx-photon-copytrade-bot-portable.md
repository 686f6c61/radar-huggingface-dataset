# mrshakogame/gmgn-bullx-photon-copytrade-bot-portable

## Resumen

El repositorio `mrshakogame/gmgn-bullx-photon-copytrade-bot-portable` no contiene un modelo de aprendizaje automatico. Se trata de un paquete de software para Windows x64 (etiquetado como portable) que, segun su model card, implementa funcionalidades de copytrading de criptomonedas sobre las plataformas GMGN, BullX y Photon, con modulos de take profit escalonado, sandbox de paper trading, motor de bundles Jito/MEV, enrutado de ordenes y filtro de honeypots.

El artefacto publicado no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. La model card describe un ejecutable (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build `v2.1.6` / `5C0BE2`) distribuido en un ZIP de 4,8 MB protegido con contrasena, alojado en un repositorio de GitHub de terceros distinto del espacio de Hugging Face. No existe ninguna indicacion de que el paquete contenga un modelo neuronal, por lo que no es evaluable como modelo de IA.

Por tanto, esta ficha documenta la ausencia de especificaciones propias de un modelo (parametros, contexto, cuantizacion, benchmarks) y advierte de los riesgos de seguridad asociados a la distribucion de binarios ejecutables sin verificacion de integridad ni trazabilidad del codigo fuente. Cualquier uso en produccion requeriria auditoria independiente del binario, algo que no puede realizarse con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete de software Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio declara etiquetas propias de un paquete de software (`windows`, `windows-11`, `x64`, `portable`) y la model card describe modulos funcionales de trading: take profit multi-nivel, sandbox de paper trading, motor de bundles Jito/MEV, enrutado de ordenes por WebSocket y gRPC, almacen de claves local AES-256 y filtro de honeypots previo a la compra.

Las cifras de rendimiento que aparecen en la model card (por ejemplo, latencias inferiores a 40 ms o 28 ms, o una consistencia del 99,3 %) no vienen acompanadas de metodologia, entorno de prueba ni codigo reproducible, por lo que no deben considerarse datos verificados. No se documenta ningun proceso de RLHF, DPO ni ajuste fino, ni tampoco innovaciones tecnicas propias de modelos generativos como atencion lineal o decodificacion especulativa.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling ni de function calling en el sentido de APIs de modelos.
- No se documenta razonamiento multi-paso ni comportamiento agentico basado en un LLM.
- La model card atribuye al paquete funciones de automatizacion de trading: take profit escalonado con trailing stop, simulacion de estrategias en sandbox, envio de bundles Jito/MEV, enrutado de ordenes de baja latencia, firma local de transacciones y verificacion de autoridades de mint/freeze y bloqueo de liquidez.
- Los idiomas listados en los metadatos corresponden a la ficha del repositorio, no a capacidades linguisticas verificadas de ningun modelo.

## Casos de uso

- Auditoria de seguridad de artefactos: el caso de uso realista es tratar el paquete como objeto de analisis en un entorno aislado (maquina virtual sin red, sandbox de reversing) para determinar que hace el binario antes de cualquier otra consideracion.
- Analisis de malware y phishing: la discrepancia entre el nombre del repositorio (bot de copytrading) y el nombre del ejecutable (`schedule-1-cheat-trainer`) es un indicador clasico de empaquetado enganoso que merece estudio en un laboratorio de threat intelligence.
- Formacion en concienciacion sobre riesgo de descargas: el caso sirve como ejemplo didactico de por que no deben ejecutarse binarios de origen desconocido protegidos con contrasena y alojados en repositorios de terceros.
- Verificacion de cadena de suministro: util para practicar la comprobacion de hashes, firmas de codigo y procedencia de artefactos antes de su despliegue en entornos corporativos.
- No es adecuado para atencion al cliente, generacion de codigo, analisis documental, traduccion, resumen ni ninguna otra tarea de procesamiento de lenguaje natural, al no contener un modelo linguistico.
- No debe emplearse para operar con fondos reales: la ausencia de codigo fuente auditable, de firma digital y de trazabilidad del binario impide garantizar la seguridad de claves privadas o de ordenes de mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de latencia y consistencia que aparecen en la model card no estan respaldadas por una metodologia reproducible ni por datos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo neuronal que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits, segun la model card.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes para este artefacto).
- Latencia y throughput: las cifras declaradas por el autor (menos de 40 ms en enrutado, menos de 28 ms en sandbox) no son verificables con la informacion disponible.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source tipico (referencia generica) | Herramienta de trading de codigo abierto auditada |
|---|---|---|---|
| Naturaleza | Paquete `.exe` para Windows | Pesos y tokenizador | Codigo fuente publico |
| Parametros | no disponible | Del orden de miles de millones | no aplica |
| Contexto | no disponible | Decenas de miles de tokens | no aplica |
| Benchmarks publicados | ninguno | MMLU, HumanEval, GSM8K, etc. | no aplica |
| Licencia | MIT | MIT, Apache 2.0, etc. | variable |
| Auditabilidad | nula (binario sin fuente) | alta (pesos y codigo) | alta |

No se identifica un modelo comparable de la misma categoria porque el artefacto no pertenece a la categoria de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y capacidad de inferencia; no puede evaluarse con criterios de MMLU, HumanEval o similares.
- Inconsistencia de nombres: el repositorio se presenta como bot de copytrading, pero el ejecutable se llama `schedule-1-cheat-trainer-v1.2.2-win64.exe`, lo que sugiere reutilizacion de empaquetados o camuflaje.
- Distribucion opaca: el ZIP se aloja en un repositorio de GitHub de un tercero distinto del autor del espacio de Hugging Face, con contrasena fija (`2026`) y sin hash ni firma publicados.
- Riesgo de seguridad elevado: ejecutar binarios sin codigo fuente, sin firma de codigo y con instrucciones de "ejecutar como administrador" expone el sistema a robo de claves, persistencia maliciosa y exfiltracion de datos.
- Riesgo financiero: cualquier funcionalidad de trading con claves privadas gestionadas por un binario no auditado puede derivar en perdida total de fondos.
- Licencia MIT declarada, pero sin fichero LICENSE verificable ni titularidad clara del codigo, lo que dificulta el cumplimiento en entornos comerciales.
- Cero descargas y cero likes en el momento de la consulta: sin senales de uso comunitario ni validacion por terceros.
- No debe desplegarse en produccion ni en maquinas con acceso a carteras de criptomonedas reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mrshakogame/gmgn-bullx-photon-copytrade-bot-portable
- Repositorio de GitHub citado en la model card: https://github.com/gchaudhry35057/gmgn-bullx-photon-copytrade-bot-portable
- Repositorio de GitHub del artefacto ZIP: https://github.com/arjunzimmermann624/schedule-1-cheat-trainer
- Enlace de descarga directa citado: https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
