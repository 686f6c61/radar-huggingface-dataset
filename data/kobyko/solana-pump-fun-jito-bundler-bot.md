# Kobyko/solana-pump-fun-jito-bundler-bot

## Resumen

`Kobyko/solana-pump-fun-jito-bundler-bot` es un repositorio alojado en Hugging Face que, pese a su identificador y a las etiquetas de idioma, no contiene un modelo de inteligencia artificial. Se trata de un binario ejecutable para Windows x64 (`solana-pump-fun-jito-bundler-bot-v1.2.0-win64.exe`, build `B5145E`) distribuido como archivo comprimido de 8,9 MB y protegido con la contraseña `2026`, según la model card del autor. El repositorio no declara pipeline, no incluye pesos y no expone ninguna arquitectura de red neuronal.

El artefacto se presenta como un bot de trading para la blockchain de Solana, con módulos orientados a operaciones sobre tokens de Pump.fun y enrutamiento de transacciones mediante Jito. La model card describe funcionalidades como filtro pre-compra de honeypots, take profit multinivel, almacén local de claves AES-256, copia de operaciones de carteras ballena, simulador de paper trading y enrutamiento de órdenes con latencia inferior a 40 ms.

Desde la perspectiva de evaluación de modelos, este repositorio no es relevante como modelo de IA: no hay parámetros, contexto, cuantizaciones ni licencia de pesos que analizar. La ficha siguiente documenta lo que el autor declara, señala explícitamente los datos no disponibles y advierte de los riesgos asociados a la ejecución de binarios de procedencia no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | No disponible (el artefacto distribuido es un `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio no contiene pesos, tokenizador, configuración de transformer ni artefactos de entrenamiento. El contenido declarado es un ejecutable nativo para Windows 10 (22H2) y Windows 11 (24H2) sobre procesadores Intel y AMD x64, empaquetado en un ZIP de 8,9 MB con contraseña `2026`.

La model card menciona módulos internos del binario (filtro de honeypots, take profit multinivel, almacén de claves AES-256, copia de operaciones, paper trading y enrutamiento de órdenes por WebSocket y gRPC a 162 Hz), pero no documenta lenguaje de implementación, dependencias, procesos de compilación ni auditorías. No se declara ningún proceso de entrenamiento, dataset, RLHF o DPO, porque no aplica.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- Las capacidades declaradas por el autor son de automatización de trading en Solana: filtro pre-compra de honeypots con verificación de autoridades de mint/freeze y bloqueo de liquidez, take profit multinivel con trailing stop, almacén local de claves AES-256 con firma no custodiada, copia de operaciones de carteras ballena con dimensionamiento proporcional, simulador de paper trading y enrutamiento de órdenes por WebSocket/gRPC.
- El autor declara soporte multilingüe en 14 idiomas a nivel de etiquetas del repositorio, sin especificar cómo se implementa en el binario.
- No se declara capacidad de visión, audio ni modo de razonamiento.

## Casos de uso

- Evaluación de artefactos sospechosos: un analista de seguridad puede usar este repositorio como caso de estudio de binarios distribuidos con contraseña en archivos comprimidos, práctica habitual para evadir análisis automáticos de antivirus y sandboxes.
- Formación en concienciación sobre cadena de suministro: sirve como ejemplo real de repositorio con etiquetas de modelo de IA que en realidad distribuye un ejecutable, útil en sesiones sobre verificación de procedencia.
- Investigación de campañas de malware en Hugging Face: el patrón (nombre de bot de trading, badges falsos de descargas, enlace a GitHub externo, contraseña en el ZIP) es representativo de campañas de distribución de software potencialmente malicioso.
- Análisis de estática de binarios: si se dispone de un entorno aislado, el ejecutable puede someterse a ingeniería inversa para estudiar técnicas de ofuscación y evasión de SmartScreen.
- Documentación de riesgos para políticas internas: equipos de seguridad pueden citar este caso al redactar reglas sobre descarga de ejecutables desde repositorios de modelos.
- No se recomienda su uso para trading real: no hay auditoría, reputación ni garantías de integridad del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Las cifras que aparecen en la model card (latencia inferior a 40 ms, respuesta en menos de 11 ms, 162 Hz de sondeo, 98,6 % de consistencia) son afirmaciones del autor sin metodología, sin entorno de medición y sin verificación independiente. No deben interpretarse como benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados: Windows 10 (22H2) o Windows 11 (24H2), procesador x64 Intel o AMD, y menos de 30 MB de RAM según la model card.
- Opciones de despliegue: ejecución nativa del `.exe` en Windows; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no verificables; las cifras del autor no son reproducibles con la información disponible.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no contiene un modelo. Como referencia de categoría, se compara con otras entradas del ecosistema de repositorios de Hugging Face que distribuyen binarios en lugar de pesos:

| Criterio | Este repositorio | Modelo de IA típico en HF | Repositorio de binario típico |
|---|---|---|---|
| Contenido | Ejecutable Windows en ZIP | Pesos safetensors/GGUF | Ejecutable o instalador |
| Parámetros | No disponible | Declarados | No aplica |
| Contexto | No disponible | Declarado | No aplica |
| Licencia | MIT (declarada) | Variable | Variable |
| Verificabilidad | Baja (ZIP con contraseña) | Alta (pesos y config) | Baja |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, razonamiento o código es infundada.
- Distribución con contraseña (`2026`) en el ZIP: práctica que dificulta el escaneo automático y la inspección del contenido antes de la ejecución.
- Ejecución como administrador recomendada por el autor: eleva el impacto potencial de cualquier comportamiento malicioso.
- Alerta de SmartScreen y Windows Defender reconocida en la propia model card: el autor justifica la advertencia por ser un binario "independiente de crypto trading", lo que no constituye una garantía de seguridad.
- Enlace de descarga apunta a un repositorio de GitHub distinto del identificador de Hugging Face (`laurent99718/...` frente a `Kobyko/...`): inconsistencia de procedencia que impide verificar la cadena de custodia.
- Badges de descargas (781K+) y valoración (99 % verificado) no verificables y potencialmente falsos.
- Riesgo de fraude financiero: un bot de trading no auditado que maneja claves privadas de Solana puede exfiltrar fondos; el almacén AES-256 local no garantiza que las claves no se transmitan.
- Licencia MIT declarada, pero sin archivo LICENSE verificable en la información proporcionada; el uso comercial de un binario no auditado conlleva riesgo legal y de responsabilidad.
- Sin sesgos de modelo que evaluar, pero sí riesgo de sesgo de selección en las carteras ballena que el bot decida copiar.
- No apto para producción en ningún escenario que implique custodia de fondos o claves privadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/solana-pump-fun-jito-bundler-bot
- Repositorio de GitHub citado en la model card: https://github.com/laurent99718/solana-pump-fun-jito-bundler-bot
- Enlace de descarga directa citado: https://github.com/laurent99718/solana-pump-fun-jito-bundler-bot/releases/latest/download/solana-pump-fun-jito-bundler-bot-v1.2.0-win64.zip
- Página de releases citada: https://github.com/laurent99718/solana-pump-fun-jito-bundler-bot/releases/latest
