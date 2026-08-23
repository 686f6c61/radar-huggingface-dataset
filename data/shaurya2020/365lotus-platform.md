# Shaurya2020/365lotus-platform

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una plantilla de software para desplegar una plataforma de apuestas deportivas, casino y sportsbook. Está desarrollado por Shaurya2020 y se presenta como un scaffold de Next.js 14 (App Router) y Node.js Express que genera una aplicación completa con rutas de administración, cartera de jugadores, jerarquía de roles y cifrado. No se trata de un modelo con arquitectura neuronal, parámetros ni entrenamiento; es código fuente orientado a producción para un sitio de apuestas en línea. La relevancia actual radica en su uso como referencia técnica para construir plataformas similares, aunque no aporta ninguna capacidad de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codigo esta en ingles) |
| Licencia | MIT (segun el README del repositorio) |
| Formato de pesos | no aplica (no hay pesos de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El repositorio contiene un generador de código (Node.js) que crea una estructura de plataforma web con dos componentes principales: un frontend Next.js 14 y un backend Express. La arquitectura de software incluye 95 rutas de administración, 18 rutas de jugador, una jerarquía de 5 roles (super_admin, super_master, master, agent, client), autenticación JWT con bcrypt, una cartera con bloqueo de exposición, cifrado AES y una base de datos SQLite con 37 tablas. No se proporcionan datos sobre tokens de entrenamiento, datasets ni técnicas como RLHF o DPO.

## Capacidades

- Generación de un sitio web completo de apuestas y casino mediante un comando (script `start.sh` o skill de Cursor).
- Gestión de cartera con bloqueo de exposición: el saldo se congela al hacer una apuesta y la exposición se descuenta del disponible.
- Liquidación de apuestas con lógica de back/lay (ganancia de back = +beneficio, ganancia de lay = +stake, nunca acredita en caso de pérdida).
- Jerarquía de roles con permisos diferenciados (super_admin, super_master, master, agent, client).
- Autenticación con JWT, contraseña de transacción y cifrado AES en la envoltura de la API.
- Registro de auditoría y libro mayor en cada movimiento de dinero.
- Verificación e2e mediante `verify.sh` (registro, inicio de sesión, depósito, apuesta, liquidación y retiro).
- Despliegue automatizado con rsync y systemd a un servidor remoto.
- Soporte de multi-tenant con tabla de white-label y resolución de host.

## Casos de uso

- **Despliegue rápido de una plataforma de apuestas**: el scaffold permite generar un sitio funcional en minutos con `tool/start.sh`, ideal para un MVP o un prototipo de negocio de betting.
- **Administración de agentes y jugadores**: la jerarquía de 5 roles facilita la gestión de subagentes y jugadores con permisos distintos, útil para operadores que necesitan una red de afiliados.
- **Gestión de cartera con control de exposición**: el modelo de cartera con bloqueo de exposición evita que un jugador apueste más de lo que tiene disponible, lo que es crítico para la gestión de riesgo en apuestas deportivas.
- **Integración de proveedores de pago y KYC**: el scaffold incluye puntos de integración para cumplimiento (KYC, pagos, geolocalización), aunque los proveedores externos deben conectarse manualmente.
- **Verificación de flujo completo**: `verify.sh` ejecuta una prueba de humo que cubre el ciclo de vida completo (registro → depósito → apuesta → liquidación → retiro), útil para validar el sistema antes de producción.
- **Despliegue en servidor propio**: `deploy.sh` sincroniza el código y reinicia el servicio systemd, lo que permite actualizar el sitio en producción sin interrupción manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica al ser un proyecto de software web, no un modelo de IA.
- El scaffold requiere Node.js y npm para ejecutarse; no hay requisitos de VRAM ni GPU.
- El despliegue se realiza en un servidor Linux (el README menciona `root@187.77.176.156`), aunque no se especifican requisitos mínimos de CPU, RAM o disco.
- Para entornos de desarrollo local, basta un ordenador con Node.js 18 o superior.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable; el repositorio es una herramienta de generación de código y no tiene equivalentes en el catálogo de modelos de Hugging Face.

## Limitaciones y advertencias

- **No es un modelo de IA**: carece de capacidades de generación de texto, razonamiento, código o visión. Todo lo que hace es generar un sitio web de apuestas.
- **Riesgo legal y de cumplimiento**: el scaffold implementa la capa técnica, pero la capa de cumplimiento (licencias, KYC/AML, procesadores de pago, geolocalización) debe ser completada con proveedores externos. Operar sin licencia puede ser ilegal en muchas jurisdicciones.
- **Seguridad**: el README advierte que no se deben enviar secretos a git; la clave de cifrado AES y el secreto JWT deben residir en variables de entorno. Si se ignoran, se compromete la seguridad de la plataforma.
- **Alucinación y sesgos**: al no ser un modelo de lenguaje, no aplica.
- **Contexto y idioma**: el código está en inglés; no se especifica soporte multilingüe.
- **Restricciones de licencia**: el scaffold es MIT, pero el sitio en vivo (365lotus.cc) tiene su propia licencia, que no se detalla.

## Enlaces

- [Hugging Face: Shaurya2020/365lotus-platform](https://huggingface.co/Shaurya2020/365lotus-platform)
- [Sitio en vivo (referenciado en el README): https://365lotus.cc](https://365lotus.cc)
- [Otros modelos del autor en Hugging Face](https://huggingface.co/Shaurya2020/models)
