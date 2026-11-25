# Romain010203/trust-wallet-metamask-seed-recovery-tool

## Resumen

El repositorio `Romain010203/trust-wallet-metamask-seed-recovery-tool` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete binario distribuido como supuesta utilidad de escritorio para Windows 10 y Windows 11 (x64), etiquetado como "portable" y presentado como herramienta de recuperacion de frases semilla (seed phrases) de monederos Trust Wallet y MetaMask. El autor declara licencia MIT y soporte para catorce idiomas en las etiquetas del repositorio.

La model card no describe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia: el campo `pipeline` aparece como no disponible y el artefacto ofrecido es un archivo ZIP de 4,8 MB con un ejecutable interno denominado `elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.exe`. La nomenclatura del binario y del enlace de descarga (que apunta a un repositorio de GitHub ajeno, con tematica de *trainers* de videojuegos) no guarda relacion con la funcion declarada, lo que constituye una senal de alarma clara.

Desde el punto de vista de la evaluacion tecnica, este repositorio no es un modelo open source: es un vector de distribucion de software potencialmente malicioso que se presenta como herramienta de recuperacion de credenciales criptograficas. Cualquier ficha de modelo convencional (parametros, contexto, cuantizacion) carece de sentido aqui, y los datos disponibles se limitan a metadatos del repositorio y al contenido de la model card, que se analiza a continuacion con fines de advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un ejecutable PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun etiquetas del repositorio) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (artefacto distribuido: ZIP de 4,8 MB con binario `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio no contiene pesos en safetensors, GGUF ni ningun otro formato de modelo, ni referencias a datasets, tokens de entrenamiento, RLHF o DPO. La model card emplea terminologia tecnica propia de fichas de modelos (SIMD, PBKDF2, BIP39, BIP44/BIP84, rotacion de RPC) para describir supuestas funciones del ejecutable, no capacidades de una red neuronal.

El binario se entrega comprimido con contrasena fija (`2026`) y se indica que debe ejecutarse "como administrador", practica habitual en campanas de distribucion de *malware* y *stealers* de credenciales. La combinacion de tematica cripto (frases semilla), ejecucion con privilegios elevados, contrasena en el archivo y un enlace de descarga alojado en un repositorio de GitHub no relacionado (tematica de *trainers* de Elden Ring) es incompatible con una herramienta legitima de recuperacion de monederos.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No hay soporte de *tool calling* ni de *function calling*.
- No hay capacidades de agente ni de razonamiento multi-paso.
- El multilingue se limita a etiquetas de idioma en los metadatos; no hay evidencia de capacidades linguisticas reales.
- Segun la model card, el ejecutable afirmaria realizar verificacion BIP39 offline, derivacion de direcciones multi-cadena (EVM, Solana, BTC) y comprobacion de saldos ERC20/SPL. Estas afirmaciones no son verificables y contradicen la naturaleza del artefacto.

## Casos de uso

- No se identifican casos de uso legitimos para un modelo de IA, porque no hay modelo.
- Auditoria de seguridad defensiva: analizar el binario en un entorno aislado (sandbox sin red, maquina virtual desechable) para caracterizar su comportamiento y generar firmas de deteccion.
- Formacion en concienciacion: usar la propia model card como ejemplo de ingenieria social dirigida a usuarios de criptomonedas, con tecnicas como contrasena fija, urgencia, insignias de "rating 4.9/5" y enlaces a repositorios ajenos.
- Investigacion de campanas de *malware*: correlacionar el patron de nombres (`trust-wallet-metamask-seed-recovery-tool`) con otras variantes similares en plataformas de alojamiento de modelos.
- Analisis de reputacion de repositorios: documentar senales de alarma (0 descargas, 0 likes, creado y actualizado el mismo instante, pipeline no disponible) para alimentar heuristicas de moderacion.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, procedimiento de rotacion inmediata de frases semilla y claves en todos los monederos afectados.
- No se recomienda ningun uso operativo del ejecutable en produccion, desarrollo ni entornos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`98,2 %` de consistencia, `269 Hz` de sondeo, `< 17 ms` de respuesta, `99,5 %` de consistencia, `96,3 %` de consistencia, valoracion `4,9/5`) son afirmaciones de marketing sin metodologia, sin conjuntos de evaluacion y sin posibilidad de reproduccion; no deben interpretarse como metricas tecnicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema declarado por el autor: Windows 10 y Windows 11, x64, procesadores Intel y AMD.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito adicional declarado: ejecucion como administrador y extraccion del ZIP con contrasena `2026`.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. A modo de referencia de categoria, se compara con otras dos clases de repositorio:

| Criterio | Este repositorio | Modelo de IA open source tipico | Herramienta legitima de monedero |
|---|---|---|---|
| Contenido | ZIP con `.exe` de 4,8 MB | Pesos safetensors/GGUF + tokenizador | Codigo fuente auditable o binario firmado |
| Parametros | no disponible | Millones a cientos de miles de millones | no aplica |
| Contexto | no disponible | 4K a 1M tokens | no aplica |
| Reproducibilidad | nula | Alta (pesos publicos) | Alta (codigo abierto) |
| Firma de codigo | no indicada | no aplica | Habitual en proyectos serios |
| Riesgo de seguridad | Muy alto | Bajo | Bajo |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con criterios de calidad, sesgo o alucinacion propios de un LLM.
- Indicadores de riesgo elevado: 0 descargas, 0 likes, creacion y actualizacion en el mismo instante (2026-11-24T21:19:35Z), ausencia de pipeline y discrepancia entre el nombre del repositorio y el del binario/enlace de descarga.
- El enlace de descarga apunta a un repositorio de GitHub (`claudio00344/elden-ring-nightreign-trainer-coop-2026`) sin relacion con monederos, lo que sugiere reutilizacion de infraestructura para distribuir *malware*.
- La solicitud de ejecucion "como administrador" y la contrasena fija en el archivo comprimido son tacticas tipicas para evadir analisis automatizado y obtener privilegios elevados.
- Una herramienta real de recuperacion de frases semilla no necesita conexion a nodos RPC ni comprobacion de saldos en cadena: la mera consulta de saldos de direcciones derivadas desde una semilla compromete la privacidad y facilita el vaciado de fondos.
- La licencia MIT declarada no otorga ninguna garantia ni avala la legitimidad del binario; la licencia se aplica al contenido del repositorio, no certifica su seguridad.
- Riesgo de perdida total de fondos: si un usuario introduce su frase semilla en este ejecutable, debe considerar la cartera comprometida y transferir los activos a una cartera nueva generada en un dispositivo limpio.
- No debe descargarse, extraerse ni ejecutarse el binario en ningun equipo con acceso a monederos, claves o credenciales.
- Recomendacion: reportar el repositorio a Hugging Face y al proveedor de GitHub correspondiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Romain010203/trust-wallet-metamask-seed-recovery-tool
- Enlace de descarga citado en la model card (no recomendado, riesgo alto): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como origen de releases (no recomendado): https://github.com/sle788/trust-wallet-metamask-seed-recovery-tool/releases/latest
- Documentacion oficial de BIP39 (referencia tecnica legitima): https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Documentacion oficial de BIP44 (referencia tecnica legitima): https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- Documentacion oficial de BIP84 (referencia tecnica legitima): https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
